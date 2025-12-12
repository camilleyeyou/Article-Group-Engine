/**
 * PDF Ingestion Script
 * 
 * Usage:
 *   npx ts-node scripts/ingest-pdf.ts <pdf-path> --type case_study --client "Amazon" --title "AWS Keynote"
 * 
 * Or for batch processing:
 *   npx ts-node scripts/ingest-pdf.ts --batch ./content/pdfs/
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Use require for pdf-parse (CommonJS module)
const pdf = require('pdf-parse');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ============================================
// CONFIGURATION
// ============================================

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 1500; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks

type AssetType = 'case_study' | 'video' | 'article' | 'deck' | 'diagram';

interface IngestOptions {
  type: AssetType;
  title: string;
  client?: string;
  description?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// TEXT PROCESSING
// ============================================

function cleanText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page numbers (common patterns)
    .replace(/\b(Page|page)\s*\d+\s*(of\s*\d+)?\b/g, '')
    // Remove common PDF artifacts
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed chunk size
    if (currentChunk.length + sentence.length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap from end of previous
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(CHUNK_OVERLAP / 5)); // Approximate word count
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // Filter out very short chunks (likely noise)
  return chunks.filter(chunk => chunk.length > 100);
}

// ============================================
// EMBEDDING GENERATION
// ============================================

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

async function generateEmbeddingsWithRetry(
  chunks: string[],
  maxRetries = 3
): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        console.log(`  Embedding chunk ${i + 1}/${chunks.length}...`);
        const embedding = await generateEmbedding(chunks[i]);
        embeddings.push(embedding);
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw new Error(`Failed to embed chunk ${i + 1} after ${maxRetries} retries`);
        }
        console.log(`  Retry ${retries}/${maxRetries} for chunk ${i + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
    
    // Rate limiting: wait a bit between embeddings
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return embeddings;
}

// ============================================
// PDF EXTRACTION
// ============================================

async function extractTextFromPDF(pdfPath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return cleanText(data.text);
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function createAsset(options: IngestOptions, content: string): Promise<string> {
  const { data, error } = await supabase
    .from('assets')
    .insert({
      type: options.type,
      title: options.title,
      client: options.client || null,
      description: options.description || null,
      content: content,
      source_url: options.sourceUrl || null,
      thumbnail_url: options.thumbnailUrl || null,
      metadata: options.metadata || {},
    })
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Failed to create asset: ${error.message}`);
  }
  
  return data.id;
}

async function storeEmbeddings(
  assetId: string,
  chunks: string[],
  embeddings: number[][]
): Promise<void> {
  const records = chunks.map((chunk, index) => ({
    asset_id: assetId,
    embedding: embeddings[index],
    chunk_index: index,
    chunk_text: chunk,
  }));
  
  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('asset_embeddings').insert(batch);
    
    if (error) {
      throw new Error(`Failed to store embeddings: ${error.message}`);
    }
  }
}

// ============================================
// MAIN INGESTION FUNCTION
// ============================================

async function ingestPDF(pdfPath: string, options: IngestOptions): Promise<string> {
  console.log(`\n📄 Processing: ${path.basename(pdfPath)}`);
  console.log(`   Title: ${options.title}`);
  console.log(`   Type: ${options.type}`);
  if (options.client) console.log(`   Client: ${options.client}`);
  
  // Step 1: Extract text
  console.log('\n1. Extracting text from PDF...');
  const text = await extractTextFromPDF(pdfPath);
  console.log(`   Extracted ${text.length} characters`);
  
  if (text.length < 100) {
    throw new Error('PDF appears to be empty or contain only images');
  }
  
  // Step 2: Chunk text
  console.log('\n2. Chunking text...');
  const chunks = chunkText(text);
  console.log(`   Created ${chunks.length} chunks`);
  
  // Step 3: Generate embeddings
  console.log('\n3. Generating embeddings...');
  const embeddings = await generateEmbeddingsWithRetry(chunks);
  console.log(`   Generated ${embeddings.length} embeddings`);
  
  // Step 4: Create asset record
  console.log('\n4. Creating asset in database...');
  const assetId = await createAsset(options, text);
  console.log(`   Asset ID: ${assetId}`);
  
  // Step 5: Store embeddings
  console.log('\n5. Storing embeddings...');
  await storeEmbeddings(assetId, chunks, embeddings);
  console.log('   Done!');
  
  console.log(`\n✅ Successfully ingested: ${options.title}`);
  console.log(`   Asset ID: ${assetId}`);
  console.log(`   Chunks: ${chunks.length}`);
  
  return assetId;
}

// ============================================
// BATCH PROCESSING
// ============================================

interface BatchConfig {
  pdfPath: string;
  options: IngestOptions;
}

async function ingestBatch(configs: BatchConfig[]): Promise<void> {
  console.log(`\n🚀 Starting batch ingestion of ${configs.length} PDFs...\n`);
  
  const results: { path: string; success: boolean; assetId?: string; error?: string }[] = [];
  
  for (const config of configs) {
    try {
      const assetId = await ingestPDF(config.pdfPath, config.options);
      results.push({ path: config.pdfPath, success: true, assetId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`\n❌ Failed to ingest ${config.pdfPath}: ${errorMessage}`);
      results.push({ path: config.pdfPath, success: false, error: errorMessage });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('BATCH INGESTION SUMMARY');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed files:');
    failed.forEach(f => console.log(`  - ${f.path}: ${f.error}`));
  }
}

// ============================================
// CLI INTERFACE
// ============================================

function printUsage(): void {
  console.log(`
📄 PDF Ingestion Script for Article Group RAG

USAGE:
  Single file:
    npx ts-node scripts/ingest-pdf.ts <pdf-path> [options]

  Batch mode:
    npx ts-node scripts/ingest-pdf.ts --batch <directory>

OPTIONS:
  --type <type>          Asset type: case_study, article, deck, diagram (default: case_study)
  --title <title>        Document title (default: filename)
  --client <client>      Client name (e.g., "Amazon", "Google")
  --description <desc>   Short description
  --url <url>            Source URL
  --thumbnail <url>      Thumbnail image URL

EXAMPLES:
  npx ts-node scripts/ingest-pdf.ts ./content/aws-keynote.pdf --type case_study --client "Amazon" --title "AWS re:Invent Keynote"
  
  npx ts-node scripts/ingest-pdf.ts ./content/narrative-framework.pdf --type article --title "Three-Layer Storytelling"

  npx ts-node scripts/ingest-pdf.ts --batch ./content/case-studies/
  `);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }
  
  // Check for batch mode
  if (args.includes('--batch')) {
    const batchIndex = args.indexOf('--batch');
    const directory = args[batchIndex + 1];
    
    if (!directory || !fs.existsSync(directory)) {
      console.error('Error: Invalid directory for batch processing');
      process.exit(1);
    }
    
    // Find all PDFs in directory
    const files = fs.readdirSync(directory).filter(f => f.toLowerCase().endsWith('.pdf'));
    
    if (files.length === 0) {
      console.error('Error: No PDF files found in directory');
      process.exit(1);
    }
    
    // Create batch configs (you'll want to customize this or use a config file)
    const configs: BatchConfig[] = files.map(file => ({
      pdfPath: path.join(directory, file),
      options: {
        type: 'case_study' as AssetType,
        title: path.basename(file, '.pdf').replace(/[-_]/g, ' '),
      },
    }));
    
    await ingestBatch(configs);
    return;
  }
  
  // Single file mode
  const pdfPath = args[0];
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: File not found: ${pdfPath}`);
    process.exit(1);
  }
  
  // Parse options
  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : undefined;
  };
  
  const options: IngestOptions = {
    type: (getArg('--type') as AssetType) || 'case_study',
    title: getArg('--title') || path.basename(pdfPath, '.pdf').replace(/[-_]/g, ' '),
    client: getArg('--client'),
    description: getArg('--description'),
    sourceUrl: getArg('--url'),
    thumbnailUrl: getArg('--thumbnail'),
  };
  
  try {
    await ingestPDF(pdfPath, options);
  } catch (error) {
    console.error(`\n❌ Ingestion failed: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
