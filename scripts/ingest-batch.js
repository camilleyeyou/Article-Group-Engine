#!/usr/bin/env node

/**
 * Batch PDF Ingestion for Article Group RAG
 * Uses pdfjs-dist (Mozilla's PDF.js) for reliable PDF parsing
 * 
 * Usage:
 *   node scripts/ingest-batch.js ./path/to/pdf/folder
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai').default;

// Load pdfjs-dist
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

require('dotenv').config({ path: '.env.local' });

// Validate environment
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables. Check .env.local');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY. Check .env.local');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

const ASSET_TYPES = ['case_study', 'article', 'deck', 'diagram', 'video'];
const CLIENTS = ['Amazon', 'Google', 'Salesforce', 'LinkedIn', 'JP Morgan', 'Xerox', 'CrowdStrike', 'Other'];

// ============================================
// PDF EXTRACTION using pdfjs-dist
// ============================================

async function extractText(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return cleanText(fullText);
}

// ============================================
// PROCESSING FUNCTIONS
// ============================================

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\b(Page|page)\s*\d+\s*(of\s*\d+)?\b/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
}

function chunkText(text, chunkSize = 1500) {
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
  return chunks.filter(c => c.length > 100);
}

async function generateEmbeddings(chunks, silent = false) {
  const embeddings = [];
  
  for (let i = 0; i < chunks.length; i++) {
    if (!silent) {
      process.stdout.write(`\r    Embedding ${i + 1}/${chunks.length}...`);
    }
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunks[i],
    });
    
    embeddings.push(response.data[0].embedding);
    await new Promise(r => setTimeout(r, 50));
  }
  
  if (!silent) console.log(' ✓');
  return embeddings;
}

// Try to guess client from filename or content
function guessClient(filename, content) {
  const text = (filename + ' ' + content.substring(0, 2000)).toLowerCase();
  
  const clientPatterns = [
    { name: 'Amazon', patterns: ['amazon', 'aws', 'alexa', 'prime', 'bezos', 'werner vogels'] },
    { name: 'Google', patterns: ['google', 'alphabet', 'youtube', 'android', 'chrome'] },
    { name: 'Salesforce', patterns: ['salesforce', 'slack', 'tableau', 'benioff'] },
    { name: 'LinkedIn', patterns: ['linkedin'] },
    { name: 'JP Morgan', patterns: ['jpmorgan', 'jp morgan', 'chase', 'dimon'] },
    { name: 'Xerox', patterns: ['xerox'] },
    { name: 'CrowdStrike', patterns: ['crowdstrike', 'crowd strike'] },
  ];
  
  for (const { name, patterns } of clientPatterns) {
    if (patterns.some(p => text.includes(p))) {
      return name;
    }
  }
  
  return null;
}

// Guess asset type from filename
function guessType(filename) {
  const lower = filename.toLowerCase();
  
  if (lower.includes('ideas_') || lower.includes('ideas/')) return 'article';
  if (lower.includes('work_') || lower.includes('work/')) return 'case_study';
  if (lower.includes('issue') || lower.includes('newsletter') || lower.includes('human conditions')) return 'article';
  if (lower.includes('about') || lower.includes('careers') || lower.includes('contact') || 
      lower.includes('privacy') || lower.includes('glossary')) return 'article';
  if (lower.includes('case') || lower.includes('study')) return 'case_study';
  if (lower.includes('article') || lower.includes('blog')) return 'article';
  if (lower.includes('deck') || lower.includes('presentation') || lower.includes('ppt')) return 'deck';
  if (lower.includes('diagram') || lower.includes('framework') || lower.includes('chart')) return 'diagram';
  if (lower.includes('guide') || lower.includes('storytelling')) return 'article';
  
  return 'article';
}

// Clean up filename to title
function filenameToTitle(filename) {
  let title = path.basename(filename, '.pdf');
  title = title.replace(/^articlegroup_com_?/, '');
  title = title.replace(/^ideas_/, '');
  title = title.replace(/^work_/, '');
  title = title.replace(/_page_\d+$/, '');
  title = title.replace(/^category_/, '');
  title = title.replace(/[-_]/g, ' ');
  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/\b\w/g, c => c.toUpperCase());
  return title || path.basename(filename, '.pdf');
}

// ============================================
// INGEST SINGLE FILE
// ============================================

async function ingestFile(pdfPath, options) {
  const { type, title, client, description } = options;
  
  const text = await extractText(pdfPath);
  if (text.length < 100) {
    throw new Error('PDF appears empty or image-only');
  }
  
  const chunks = chunkText(text);
  if (chunks.length === 0) {
    throw new Error('No text chunks extracted');
  }
  
  const embeddings = await generateEmbeddings(chunks, false);
  
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert({
      type,
      title,
      client,
      description,
      content: text,
      metadata: { 
        source_file: path.basename(pdfPath), 
        ingested_at: new Date().toISOString(),
        chunk_count: chunks.length 
      },
    })
    .select('id')
    .single();
  
  if (assetError) throw new Error(assetError.message);
  
  const records = chunks.map((chunk, i) => ({
    asset_id: asset.id,
    embedding: embeddings[i],
    chunk_index: i,
    chunk_text: chunk,
  }));
  
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    const { error } = await supabase.from('asset_embeddings').insert(batch);
    if (error) throw new Error(error.message);
  }
  
  return { assetId: asset.id, chunks: chunks.length, chars: text.length };
}

// ============================================
// MAIN
// ============================================

async function main() {
  const folderPath = process.argv[2];
  
  if (!folderPath) {
    console.log('\n📁 Batch PDF Ingestion\n');
    console.log('Usage: node scripts/ingest-batch.js <folder-path>\n');
    console.log('Example: node scripts/ingest-batch.js ./content\n');
    rl.close();
    process.exit(0);
  }
  
  if (!fs.existsSync(folderPath)) {
    console.error('❌ Folder not found:', folderPath);
    rl.close();
    process.exit(1);
  }
  
  const files = fs.readdirSync(folderPath)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => path.join(folderPath, f));
  
  if (files.length === 0) {
    console.error('❌ No PDF files found in:', folderPath);
    rl.close();
    process.exit(1);
  }
  
  console.log('\n📁 Batch PDF Ingestion\n');
  console.log('='.repeat(50));
  console.log(`Found ${files.length} PDF files in ${folderPath}\n`);
  
  files.forEach((f, i) => console.log(`  ${i + 1}. ${path.basename(f)}`));
  
  console.log('\n' + '-'.repeat(50));
  console.log('\nIngestion modes:');
  console.log('  1. Interactive - Prompt for each file');
  console.log('  2. Smart Auto  - Guess client/type from filename & content');
  console.log('  3. Same for All - Apply same type/client to all files');
  
  const mode = parseInt(await question('\nChoose mode (1-3) [2]: ')) || 2;
  
  let defaultType = 'article';
  let defaultClient = null;
  
  if (mode === 3) {
    console.log('\nAsset type for ALL files:');
    ASSET_TYPES.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
    const typeIdx = parseInt(await question('Choose (1-5) [2=article]: ')) || 2;
    defaultType = ASSET_TYPES[typeIdx - 1] || 'article';
    
    console.log('\nClient for ALL files:');
    CLIENTS.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    console.log('  9. None');
    const clientIdx = parseInt(await question('Choose (1-9) [9=None]: ')) || 9;
    if (clientIdx <= CLIENTS.length) {
      defaultClient = CLIENTS[clientIdx - 1];
      if (defaultClient === 'Other') {
        defaultClient = await question('Enter client name: ');
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Starting ingestion...\n');
  
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const pdfPath = files[i];
    const filename = path.basename(pdfPath);
    
    console.log(`\n[${i + 1}/${files.length}] ${filename}`);
    console.log('-'.repeat(40));
    
    try {
      let type, title, client, description;
      
      if (mode === 1) {
        title = filenameToTitle(filename);
        console.log('  Extracting preview...');
        const previewText = await extractText(pdfPath);
        const preview = previewText.substring(0, 200) + '...';
        console.log(`\n  Preview: "${preview}"\n`);
        
        const suggestedClient = guessClient(filename, previewText);
        const suggestedType = guessType(filename);
        
        title = (await question(`  Title [${title}]: `)) || title;
        console.log('  Type options:', ASSET_TYPES.join(', '));
        const typeInput = await question(`  Type [${suggestedType}]: `);
        type = typeInput || suggestedType;
        if (!ASSET_TYPES.includes(type)) type = suggestedType;
        
        const clientPrompt = suggestedClient ? `  Client [${suggestedClient}]: ` : '  Client (or Enter to skip): ';
        client = (await question(clientPrompt)) || suggestedClient;
        description = await question('  Description (optional): ') || null;
        
      } else if (mode === 2) {
        console.log('  Analyzing...');
        const text = await extractText(pdfPath);
        title = filenameToTitle(filename);
        type = guessType(filename);
        client = guessClient(filename, text);
        description = null;
        console.log(`  → Title: ${title}`);
        console.log(`  → Type: ${type}`);
        console.log(`  → Client: ${client || '(none)'}`);
        
      } else {
        title = filenameToTitle(filename);
        type = defaultType;
        client = defaultClient;
        description = null;
        console.log(`  → Title: ${title}`);
        console.log(`  → Type: ${type}`);
        console.log(`  → Client: ${client || '(none)'}`);
      }
      
      console.log('  Processing...');
      const result = await ingestFile(pdfPath, { type, title, client, description });
      console.log(`  ✅ Done! (${result.chunks} chunks, ${result.chars.toLocaleString()} chars)`);
      results.push({ file: filename, success: true, ...result });
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      results.push({ file: filename, success: false, error: error.message });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successful: ${successful.length}/${files.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(f => console.log(`   - ${f.file}: ${f.error}`));
  }
  
  console.log('\nTotal chunks created:', successful.reduce((sum, r) => sum + r.chunks, 0));
  console.log('\nAll content is now searchable in the RAG system.\n');
  
  rl.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  rl.close();
  process.exit(1);
});
