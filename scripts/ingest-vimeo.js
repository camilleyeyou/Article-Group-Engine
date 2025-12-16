#!/usr/bin/env node

/**
 * Vimeo Video Ingestion for Article Group RAG
 * 
 * Usage:
 *   node scripts/ingest-vimeo.js                    # Fetch all videos from account
 *   node scripts/ingest-vimeo.js --showcase 12345  # Fetch from specific showcase
 *   node scripts/ingest-vimeo.js --video 12345     # Fetch single video
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai').default;

// Validate environment
if (!process.env.VIMEO_ACCESS_TOKEN) {
  console.error('❌ Missing VIMEO_ACCESS_TOKEN in .env.local');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY');
  process.exit(1);
}

const VIMEO_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_API = 'https://api.vimeo.com';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// VIMEO API HELPERS
// ============================================

async function vimeoRequest(endpoint, params = {}) {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${VIMEO_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${VIMEO_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vimeo.*+json;version=3.4',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vimeo API error (${response.status}): ${error}`);
  }
  
  return response.json();
}

async function getAllVideos() {
  console.log('📹 Fetching all videos from account...\n');
  
  const videos = [];
  let nextPage = '/me/videos';
  
  while (nextPage) {
    const data = await vimeoRequest(nextPage, { per_page: 100 });
    videos.push(...data.data);
    
    console.log(`  Fetched ${videos.length} videos...`);
    
    // Check for next page
    nextPage = data.paging?.next || null;
    
    // Rate limit
    await new Promise(r => setTimeout(r, 100));
  }
  
  return videos;
}

async function getShowcaseVideos(showcaseId) {
  console.log(`📹 Fetching videos from showcase ${showcaseId}...\n`);
  
  const videos = [];
  let nextPage = `/me/albums/${showcaseId}/videos`;
  
  while (nextPage) {
    const data = await vimeoRequest(nextPage, { per_page: 100 });
    videos.push(...data.data);
    
    console.log(`  Fetched ${videos.length} videos...`);
    
    nextPage = data.paging?.next || null;
    await new Promise(r => setTimeout(r, 100));
  }
  
  return videos;
}

async function getVideo(videoId) {
  console.log(`📹 Fetching video ${videoId}...\n`);
  const data = await vimeoRequest(`/videos/${videoId}`);
  return [data];
}

async function getVideoTextTracks(videoUri) {
  try {
    const data = await vimeoRequest(`${videoUri}/texttracks`);
    return data.data || [];
  } catch {
    return [];
  }
}

async function getTranscript(textTrackUrl) {
  try {
    const response = await fetch(textTrackUrl);
    if (!response.ok) return null;
    
    const vttContent = await response.text();
    
    // Parse VTT to plain text (remove timestamps and formatting)
    const lines = vttContent.split('\n');
    const textLines = [];
    
    for (const line of lines) {
      // Skip WEBVTT header, timestamps, and empty lines
      if (line.startsWith('WEBVTT') || 
          line.includes('-->') || 
          line.match(/^\d+$/) ||
          line.trim() === '') {
        continue;
      }
      // Remove VTT tags like <c> </c>
      const cleanLine = line.replace(/<[^>]+>/g, '').trim();
      if (cleanLine) {
        textLines.push(cleanLine);
      }
    }
    
    return textLines.join(' ');
  } catch {
    return null;
  }
}

// ============================================
// PROCESSING
// ============================================

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
}

function chunkText(text, chunkSize = 1500) {
  if (!text || text.length < 100) return [];
  
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks.filter(c => c.length > 50);
}

async function generateEmbeddings(chunks) {
  const embeddings = [];
  
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`\r    Embedding ${i + 1}/${chunks.length}...`);
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunks[i],
    });
    
    embeddings.push(response.data[0].embedding);
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log(' ✓');
  return embeddings;
}

async function categorizeVideo(title, description) {
  const prompt = `Categorize this video for a B2B marketing agency.

TITLE: ${title}
DESCRIPTION: ${description || 'No description'}

Which business capability is this MOST relevant to?
Options:
- narrative-frameworks
- positioning-messaging
- gtm-strategy
- journey-persona
- editorial-strategy
- thought-leadership
- copywriting
- social-strategy
- brand-design
- design-systems
- video-production
- sales-collateral
- keynote-events
- partner-marketing

Respond in JSON: {"capability": "slug", "is_case_study": true/false}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return { capability: 'video-production', is_case_study: false };
  }
}

// ============================================
// INGESTION
// ============================================

async function ingestVideo(video) {
  const videoId = video.uri.split('/').pop();
  const title = video.name;
  const description = video.description || '';
  const duration = video.duration; // seconds
  const thumbnail = video.pictures?.sizes?.find(s => s.width >= 640)?.link || 
                    video.pictures?.sizes?.[0]?.link || null;
  
  console.log(`\n  Title: ${title}`);
  console.log(`  Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
  
  // Check if already ingested
  const { data: existing } = await supabase
    .from('assets')
    .select('id')
    .eq('vimeo_id', videoId)
    .single();
  
  if (existing) {
    console.log('  ⏭️  Already ingested, skipping...');
    return { skipped: true };
  }
  
  // Try to get transcript
  let transcript = null;
  const textTracks = await getVideoTextTracks(video.uri);
  
  if (textTracks.length > 0) {
    const englishTrack = textTracks.find(t => t.language === 'en') || textTracks[0];
    if (englishTrack?.link) {
      console.log('  📝 Fetching transcript...');
      transcript = await getTranscript(englishTrack.link);
    }
  }
  
  // Build content for embeddings
  let content = `${title}\n\n${description}`;
  if (transcript) {
    content += `\n\nTranscript:\n${transcript}`;
    console.log(`  ✓ Transcript: ${transcript.length.toLocaleString()} chars`);
  } else {
    console.log('  ⚠️  No transcript available');
  }
  
  content = cleanText(content);
  
  // Categorize
  console.log('  🏷️  Categorizing...');
  const categorization = await categorizeVideo(title, description);
  console.log(`  → ${categorization.capability} (case_study: ${categorization.is_case_study})`);
  
  // Create chunks and embeddings
  const chunks = chunkText(content);
  
  if (chunks.length === 0) {
    // If no meaningful chunks, create one from title + description
    chunks.push(cleanText(`${title}. ${description}`));
  }
  
  console.log(`  📊 Creating ${chunks.length} chunks...`);
  const embeddings = await generateEmbeddings(chunks);
  
  // Insert asset
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert({
      type: 'video',
      title,
      description: description || null,
      content,
      vimeo_id: videoId,
      thumbnail_url: thumbnail,
      source_url: video.link,
      metadata: {
        duration_seconds: duration,
        primary_capability: categorization.capability,
        is_case_study: categorization.is_case_study,
        has_transcript: !!transcript,
        ingested_at: new Date().toISOString(),
      },
    })
    .select('id')
    .single();
  
  if (assetError) {
    throw new Error(`Failed to insert asset: ${assetError.message}`);
  }
  
  // Insert embeddings
  const records = chunks.map((chunk, i) => ({
    asset_id: asset.id,
    embedding: embeddings[i],
    chunk_index: i,
    chunk_text: chunk,
  }));
  
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    const { error } = await supabase.from('asset_embeddings').insert(batch);
    if (error) throw new Error(`Failed to insert embeddings: ${error.message}`);
  }
  
  console.log(`  ✅ Done! Asset ID: ${asset.id}`);
  
  return { 
    success: true, 
    assetId: asset.id, 
    chunks: chunks.length,
    hasTranscript: !!transcript 
  };
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n🎬 Vimeo Video Ingestion\n');
  console.log('='.repeat(50));
  
  // Parse arguments
  const args = process.argv.slice(2);
  let videos = [];
  
  if (args.includes('--showcase')) {
    const showcaseId = args[args.indexOf('--showcase') + 1];
    if (!showcaseId) {
      console.error('❌ Please provide a showcase ID');
      process.exit(1);
    }
    videos = await getShowcaseVideos(showcaseId);
  } else if (args.includes('--video')) {
    const videoId = args[args.indexOf('--video') + 1];
    if (!videoId) {
      console.error('❌ Please provide a video ID');
      process.exit(1);
    }
    videos = await getVideo(videoId);
  } else {
    videos = await getAllVideos();
  }
  
  console.log(`\nFound ${videos.length} videos to process\n`);
  console.log('='.repeat(50));
  
  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    withTranscript: 0,
  };
  
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    console.log(`\n[${i + 1}/${videos.length}] Processing: ${video.name?.substring(0, 50)}...`);
    console.log('-'.repeat(40));
    
    try {
      const result = await ingestVideo(video);
      
      if (result.skipped) {
        results.skipped++;
      } else if (result.success) {
        results.success++;
        if (result.hasTranscript) results.withTranscript++;
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      results.failed++;
    }
    
    // Rate limit between videos
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`\n✅ Successfully ingested: ${results.success}`);
  console.log(`📝 With transcripts: ${results.withTranscript}`);
  console.log(`⏭️  Skipped (already exists): ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`\nTotal videos processed: ${videos.length}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
