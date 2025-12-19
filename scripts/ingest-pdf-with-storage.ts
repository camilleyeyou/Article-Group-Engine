/**
 * PDF Ingestion Script with Storage
 * 
 * This script:
 * 1. Uploads the original PDF to Supabase Storage
 * 2. Extracts text for RAG search
 * 3. Creates embeddings for semantic search
 * 4. Stores pdf_url so we can display the original beautiful PDF
 * 
 * Usage:
 *   npx ts-node scripts/ingest-pdf-with-storage.ts <pdf-path> --type case_study --client "Amazon" --title "AWS Keynote"
 * 
 * Or for batch processing:
 *   npx ts-node scripts/ingest-pdf-with-storage.ts --batch ./content/pdfs/
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
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;
const STORAGE_BUCKET = 'pdfs'; // Supabase storage bucket name

type AssetType = 'case_study' | 'video' | 'article' | 'deck' | 'diagram' | 'guide';

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
// SUPABASE STORAGE
// ============================================

async function ensureBucketExists(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET);
  
  if (!bucketExists) {
    console.log(`  Creating storage bucket: ${STORAGE_BUCKET}`);
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true, // Make PDFs publicly accessible
      fileSizeLimit: 52428800, // 50MB limit
      allowedMimeTypes: ['application/pdf'],
    });
    
    if (error) {
      throw new Error(`Failed to create storage bucket: ${error.message}`);
    }
  }
}

async function uploadPDFToStorage(pdfPath: string, filename: string): Promise<string> {
  await ensureBucketExists();
  
  const fileBuffer = fs.readFileSync(pdfPath);
  const sanitizedFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
  
  const storagePath = `documents/${Date.now()}-${sanitizedFilename}`;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }
  
  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);
  
  return urlData.publicUrl;
}

// ============================================
// TEXT PROCESSING
// ============================================

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\b(Page|page)\s*\d+\s*(of\s*\d+)?\b/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(CHUNK_OVERLAP / 5));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
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
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
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

async function createAsset(
  options: IngestOptions, 
  content: string, 
  pdfUrl: string
): Promise<string> {
  const { data, error } = await supabase
    .from('assets')
    .insert({
      type: options.type,
      title: options.title,
      client: options.client || null,
      description: options.description || null,
      content: content,
      source_url: options.sourceUrl || pdfUrl, // Use PDF URL as source
      pdf_url: pdfUrl, // Store the PDF URL
      thumbnail_url: options.thumbnailUrl || null,
      metadata: {
        ...options.metadata,
        source_file: path.basename(options.title),
        has_pdf: true,
      },
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
  
  // Step 1: Upload PDF to storage
  console.log('\n1. Uploading PDF to Supabase Storage...');
  const pdfUrl = await uploadPDFToStorage(pdfPath, `${options.title}.pdf`);
  console.log(`   PDF URL: ${pdfUrl}`);
  
  // Step 2: Extract text for RAG
  console.log('\n2. Extracting text from PDF...');
  const text = await extractTextFromPDF(pdfPath);
  console.log(`   Extracted ${text.length} characters`);
  
  if (text.length < 100) {
    console.log('   ⚠️  Warning: PDF appears to be image-based or have little text');
    console.log('   The PDF will still be viewable, but search may be limited');
  }
  
  // Step 3: Chunk text
  console.log('\n3. Chunking text...');
  const chunks = chunkText(text);
  console.log(`   Created ${chunks.length} chunks`);
  
  // Step 4: Generate embeddings (if we have text)
  let embeddings: number[][] = [];
  if (chunks.length > 0) {
    console.log('\n4. Generating embeddings...');
    embeddings = await generateEmbeddingsWithRetry(chunks);
    console.log(`   Generated ${embeddings.length} embeddings`);
  } else {
    console.log('\n4. Skipping embeddings (no text chunks)');
  }
  
  // Step 5: Create asset record
  console.log('\n5. Creating asset in database...');
  const assetId = await createAsset(options, text, pdfUrl);
  console.log(`   Asset ID: ${assetId}`);
  
  // Step 6: Store embeddings (if any)
  if (embeddings.length > 0) {
    console.log('\n6. Storing embeddings...');
    await storeEmbeddings(assetId, chunks, embeddings);
    console.log('   Done!');
  }
  
  console.log(`\n✅ Successfully ingested: ${options.title}`);
  console.log(`   Asset ID: ${assetId}`);
  console.log(`   PDF URL: ${pdfUrl}`);
  console.log(`   Chunks: ${chunks.length}`);
  
  return assetId;
}

// ============================================
// UPDATE EXISTING ASSETS WITH PDF URLs
// ============================================

async function updateExistingAssetWithPDF(
  assetId: string, 
  pdfPath: string
): Promise<void> {
  console.log(`\n📎 Adding PDF to existing asset: ${assetId}`);
  
  // Get asset info
  const { data: asset, error: fetchError } = await supabase
    .from('assets')
    .select('title')
    .eq('id', assetId)
    .single();
  
  if (fetchError || !asset) {
    throw new Error(`Asset not found: ${assetId}`);
  }
  
  // Upload PDF
  console.log('  Uploading PDF...');
  const pdfUrl = await uploadPDFToStorage(pdfPath, `${asset.title}.pdf`);
  
  // Update asset record
  const { error: updateError } = await supabase
    .from('assets')
    .update({ 
      pdf_url: pdfUrl,
      metadata: {
        has_pdf: true,
        pdf_added_at: new Date().toISOString(),
      }
    })
    .eq('id', assetId);
  
  if (updateError) {
    throw new Error(`Failed to update asset: ${updateError.message}`);
  }
  
  console.log(`✅ PDF added: ${pdfUrl}`);
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
  
  const results: { path: string; success: boolean; assetId?: string; pdfUrl?: string; error?: string }[] = [];
  
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
📄 PDF Ingestion Script with Storage for Article Group RAG

This script uploads PDFs to Supabase Storage so they can be displayed 
in their original beautiful format, while also extracting text for search.

USAGE:
  Single file:
    npx ts-node scripts/ingest-pdf-with-storage.ts <pdf-path> [options]

  Batch mode:
    npx ts-node scripts/ingest-pdf-with-storage.ts --batch <directory>

  Add PDF to existing asset:
    npx ts-node scripts/ingest-pdf-with-storage.ts --add-to <asset-id> <pdf-path>

OPTIONS:
  --type <type>          Asset type: case_study, article, deck, diagram, guide (default: case_study)
  --title <title>        Document title (default: filename)
  --client <client>      Client name (e.g., "Amazon", "Google")
  --description <desc>   Short description
  --url <url>            Source URL
  --thumbnail <url>      Thumbnail image URL

EXAMPLES:
  # Ingest new PDF
  npx ts-node scripts/ingest-pdf-with-storage.ts ./content/aws-keynote.pdf \\
    --type case_study --client "Amazon" --title "AWS re:Invent Keynote"
  
  # Batch ingest all PDFs in a folder
  npx ts-node scripts/ingest-pdf-with-storage.ts --batch ./content/case-studies/
  
  # Add PDF to existing asset
  npx ts-node scripts/ingest-pdf-with-storage.ts --add-to abc123 ./content/doc.pdf
  `);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }
  
  // Add PDF to existing asset mode
  if (args.includes('--add-to')) {
    const addToIndex = args.indexOf('--add-to');
    const assetId = args[addToIndex + 1];
    const pdfPath = args[addToIndex + 2];
    
    if (!assetId || !pdfPath) {
      console.error('Error: --add-to requires asset ID and PDF path');
      process.exit(1);
    }
    
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: File not found: ${pdfPath}`);
      process.exit(1);
    }
    
    try {
      await updateExistingAssetWithPDF(assetId, pdfPath);
    } catch (error) {
      console.error(`\n❌ Failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
    return;
  }
  
  // Batch mode
  if (args.includes('--batch')) {
    const batchIndex = args.indexOf('--batch');
    const directory = args[batchIndex + 1];
    
    if (!directory || !fs.existsSync(directory)) {
      console.error('Error: Invalid directory for batch processing');
      process.exit(1);
    }
    
    const files = fs.readdirSync(directory).filter(f => f.toLowerCase().endsWith('.pdf'));
    
    if (files.length === 0) {
      console.error('Error: No PDF files found in directory');
      process.exit(1);
    }
    
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
