#!/usr/bin/env node

/**
 * Single PDF Ingestion
 * Uses pdfjs-dist (Mozilla's PDF.js) for reliable PDF parsing
 * 
 * Usage:
 *   node scripts/ingest.js
 *   node scripts/ingest.js ./path/to/file.pdf
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai').default;

// Load pdfjs-dist
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

require('dotenv').config({ path: '.env.local' });

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
const CLIENTS = ['Amazon', 'Google', 'Salesforce', 'LinkedIn', 'JP Morgan', 'Other', 'None'];

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

async function generateEmbeddings(chunks) {
  const embeddings = [];
  
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`\r  Embedding chunk ${i + 1}/${chunks.length}...`);
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunks[i],
    });
    
    embeddings.push(response.data[0].embedding);
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(' Done!');
  return embeddings;
}

async function main() {
  console.log('\n📄 Article Group PDF Ingestion Tool\n');
  console.log('='.repeat(40) + '\n');
  
  let pdfPath = process.argv[2];
  
  if (!pdfPath) {
    pdfPath = await question('Enter PDF file path: ');
  }
  
  pdfPath = pdfPath.trim().replace(/^['"]|['"]$/g, '');
  
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ File not found:', pdfPath);
    rl.close();
    process.exit(1);
  }
  
  if (fs.statSync(pdfPath).isDirectory()) {
    console.error('❌ That is a directory, not a file.');
    console.error('   Use: node scripts/ingest-batch.js ' + pdfPath);
    rl.close();
    process.exit(1);
  }
  
  console.log(`\n📁 File: ${path.basename(pdfPath)}\n`);
  
  console.log('Asset type:');
  ASSET_TYPES.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  const typeIndex = parseInt(await question('\nChoose type (1-5) [1]: ')) || 1;
  const assetType = ASSET_TYPES[typeIndex - 1] || 'case_study';
  
  const defaultTitle = path.basename(pdfPath, '.pdf').replace(/[-_]/g, ' ');
  const title = (await question(`\nTitle [${defaultTitle}]: `)) || defaultTitle;
  
  console.log('\nClient:');
  CLIENTS.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  const clientIndex = parseInt(await question('\nChoose client (1-7) [7=None]: ')) || 7;
  
  let client = null;
  if (clientIndex > 0 && clientIndex < 7) {
    if (CLIENTS[clientIndex - 1] === 'Other') {
      client = await question('Enter client name: ');
    } else {
      client = CLIENTS[clientIndex - 1];
    }
  }
  
  const description = (await question('\nDescription (optional): ')) || null;
  
  console.log('\n' + '-'.repeat(40));
  console.log('Summary:');
  console.log(`  File:        ${path.basename(pdfPath)}`);
  console.log(`  Type:        ${assetType}`);
  console.log(`  Title:       ${title}`);
  console.log(`  Client:      ${client || '(none)'}`);
  console.log(`  Description: ${description || '(none)'}`);
  console.log('-'.repeat(40));
  
  const confirm = await question('\nProceed? (Y/n): ');
  if (confirm.toLowerCase() === 'n') {
    console.log('Cancelled.');
    rl.close();
    return;
  }
  
  console.log('\n🔄 Processing...\n');
  
  try {
    console.log('1. Extracting text from PDF...');
    const text = await extractText(pdfPath);
    console.log(`   ✓ Extracted ${text.length.toLocaleString()} characters`);
    
    if (text.length < 100) {
      throw new Error('PDF appears to be empty or contains only images');
    }
    
    console.log('\n2. Chunking text...');
    const chunks = chunkText(text);
    console.log(`   ✓ Created ${chunks.length} chunks`);
    
    console.log('\n3. Generating embeddings...');
    const embeddings = await generateEmbeddings(chunks);
    
    console.log('\n4. Saving to database...');
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        type: assetType,
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
    
    if (assetError) throw new Error(`Database error: ${assetError.message}`);
    
    console.log(`   ✓ Created asset: ${asset.id}`);
    
    console.log('\n5. Storing embeddings...');
    const embeddingRecords = chunks.map((chunk, i) => ({
      asset_id: asset.id,
      embedding: embeddings[i],
      chunk_index: i,
      chunk_text: chunk,
    }));
    
    for (let i = 0; i < embeddingRecords.length; i += 50) {
      const batch = embeddingRecords.slice(i, i + 50);
      const { error: embError } = await supabase.from('asset_embeddings').insert(batch);
      if (embError) throw new Error(`Embedding storage error: ${embError.message}`);
    }
    
    console.log(`   ✓ Stored ${embeddingRecords.length} embeddings`);
    
    console.log('\n' + '='.repeat(40));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(40));
    console.log(`\nAsset ID: ${asset.id}`);
    console.log(`Title:    ${title}`);
    console.log(`Chunks:   ${chunks.length}`);
    console.log(`\nThis content is now searchable in the RAG system.\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
  
  const another = await question('Ingest another PDF? (y/N): ');
  rl.close();
  
  if (another.toLowerCase() === 'y') {
    const { spawn } = require('child_process');
    spawn('node', ['scripts/ingest.js'], { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
