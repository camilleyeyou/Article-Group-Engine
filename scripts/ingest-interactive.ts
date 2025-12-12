/**
 * Interactive PDF Ingestion
 * 
 * A simpler way to ingest PDFs with prompts for metadata.
 * 
 * Usage:
 *   npx ts-node scripts/ingest-interactive.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Use require for pdf-parse (CommonJS module)
const pdf = require('pdf-parse');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise(resolve => rl.question(prompt, resolve));
};

const ASSET_TYPES = ['case_study', 'video', 'article', 'deck', 'diagram'] as const;
const CLIENTS = ['Amazon', 'Google', 'Salesforce', 'LinkedIn', 'JP Morgan', 'Other'];

// ============================================
// PROCESSING FUNCTIONS
// ============================================

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\b(Page|page)\s*\d+\s*(of\s*\d+)?\b/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
}

function chunkText(text: string, chunkSize = 1500): string[] {
  const chunks: string[] = [];
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

async function extractText(pdfPath: string): Promise<string> {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdf(buffer);
  return cleanText(data.text);
}

async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`\r  Embedding chunk ${i + 1}/${chunks.length}...`);
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunks[i],
    });
    
    embeddings.push(response.data[0].embedding);
    await new Promise(r => setTimeout(r, 100)); // Rate limiting
  }
  
  console.log(' Done!');
  return embeddings;
}

// ============================================
// MAIN INTERACTIVE FLOW
// ============================================

async function main() {
  console.log('\n📄 Article Group PDF Ingestion Tool\n');
  console.log('=' .repeat(40) + '\n');
  
  // Step 1: Get PDF path
  let pdfPath = await question('Enter PDF file path (or drag & drop): ');
  pdfPath = pdfPath.trim().replace(/^['"]|['"]$/g, ''); // Remove quotes from drag/drop
  
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ File not found:', pdfPath);
    rl.close();
    return;
  }
  
  // Step 2: Asset type
  console.log('\nAsset type:');
  ASSET_TYPES.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  const typeIndex = parseInt(await question('Choose type (1-5) [1]: ')) || 1;
  const assetType = ASSET_TYPES[typeIndex - 1] || 'case_study';
  
  // Step 3: Title
  const defaultTitle = path.basename(pdfPath, '.pdf').replace(/[-_]/g, ' ');
  const title = (await question(`Title [${defaultTitle}]: `)) || defaultTitle;
  
  // Step 4: Client
  console.log('\nClient:');
  CLIENTS.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  const clientIndex = parseInt(await question('Choose client (1-6, or 0 for none) [0]: ')) || 0;
  let client: string | null = null;
  if (clientIndex > 0 && clientIndex <= CLIENTS.length) {
    if (CLIENTS[clientIndex - 1] === 'Other') {
      client = await question('Enter client name: ');
    } else {
      client = CLIENTS[clientIndex - 1];
    }
  }
  
  // Step 5: Description (optional)
  const description = await question('Description (optional): ') || null;
  
  // Step 6: Confirm
  console.log('\n' + '-'.repeat(40));
  console.log('Summary:');
  console.log(`  File: ${path.basename(pdfPath)}`);
  console.log(`  Type: ${assetType}`);
  console.log(`  Title: ${title}`);
  console.log(`  Client: ${client || '(none)'}`);
  console.log(`  Description: ${description || '(none)'}`);
  console.log('-'.repeat(40));
  
  const confirm = await question('\nProceed with ingestion? (y/n) [y]: ');
  if (confirm.toLowerCase() === 'n') {
    console.log('Cancelled.');
    rl.close();
    return;
  }
  
  // Step 7: Process
  console.log('\n🔄 Processing...\n');
  
  try {
    // Extract text
    console.log('1. Extracting text from PDF...');
    const text = await extractText(pdfPath);
    console.log(`   ✓ Extracted ${text.length.toLocaleString()} characters`);
    
    if (text.length < 100) {
      throw new Error('PDF appears to be empty or image-only');
    }
    
    // Chunk
    console.log('\n2. Chunking text...');
    const chunks = chunkText(text);
    console.log(`   ✓ Created ${chunks.length} chunks`);
    
    // Generate embeddings
    console.log('\n3. Generating embeddings...');
    const embeddings = await generateEmbeddings(chunks);
    
    // Create asset
    console.log('\n4. Saving to database...');
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        type: assetType,
        title,
        client,
        description,
        content: text,
        metadata: { source_file: path.basename(pdfPath), ingested_at: new Date().toISOString() },
      })
      .select('id')
      .single();
    
    if (assetError) throw new Error(`Failed to create asset: ${assetError.message}`);
    
    console.log(`   ✓ Created asset: ${asset.id}`);
    
    // Store embeddings
    console.log('\n5. Storing embeddings...');
    const embeddingRecords = chunks.map((chunk, i) => ({
      asset_id: asset.id,
      embedding: embeddings[i],
      chunk_index: i,
      chunk_text: chunk,
    }));
    
    const { error: embError } = await supabase.from('asset_embeddings').insert(embeddingRecords);
    if (embError) throw new Error(`Failed to store embeddings: ${embError.message}`);
    
    console.log(`   ✓ Stored ${embeddingRecords.length} embeddings`);
    
    // Success!
    console.log('\n' + '='.repeat(40));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(40));
    console.log(`\nAsset ID: ${asset.id}`);
    console.log(`Title: ${title}`);
    console.log(`Chunks: ${chunks.length}`);
    console.log(`\nThis content is now searchable in the RAG system.`);
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  }
  
  // Ask if they want to ingest another
  const another = await question('\nIngest another PDF? (y/n) [n]: ');
  rl.close();
  
  if (another.toLowerCase() === 'y') {
    // Restart
    const { spawn } = require('child_process');
    spawn('npx', ['ts-node', 'scripts/ingest-interactive.ts'], { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  }
}

main().catch(console.error);
