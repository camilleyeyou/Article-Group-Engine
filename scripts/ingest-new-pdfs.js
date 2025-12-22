/**
 * INGEST NEW PDFs
 * 
 * This script:
 * 1. Uploads each PDF to Supabase Storage
 * 2. Extracts text from the PDF
 * 3. Creates the asset with pdf_url linked
 * 4. Creates embeddings for search
 * 
 * Run: node scripts/ingest-new-pdfs.js ./content/
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const pdf = require('pdf-parse');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// ============================================
// HELPERS
// ============================================

function sanitizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

function extractTitleFromFilename(filename) {
  return path.basename(filename, '.pdf')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}

function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }
  
  return chunks;
}

async function createEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limit input size
  });
  return response.data[0].embedding;
}

// ============================================
// MAIN INGESTION
// ============================================

async function ingestPdf(pdfPath) {
  const filename = path.basename(pdfPath);
  console.log(`\n📄 Processing: ${filename}`);

  try {
    // 1. Read PDF
    const fileBuffer = fs.readFileSync(pdfPath);
    
    // 2. Extract text
    let extractedText = '';
    try {
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text || '';
    } catch (e) {
      console.log(`   ⚠️  Could not extract text (might be image-based PDF)`);
    }

    // 3. Upload to storage
    const sanitized = sanitizeFilename(filename);
    const storagePath = `documents/${Date.now()}-${sanitized}`;
    
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/${storagePath}`;
    console.log(`   ☁️  Uploaded to storage`);

    // 4. Create asset
    const title = extractTitleFromFilename(filename);
    const description = extractedText.slice(0, 500).replace(/\s+/g, ' ').trim();
    
    // Determine asset type based on filename
    const filenameLower = filename.toLowerCase();
    let assetType = 'article'; // default
    if (filenameLower.includes('case_study') || filenameLower.includes('case study')) {
      assetType = 'case_study';
    } else if (filenameLower.includes('deck') || filenameLower.includes('presentation')) {
      assetType = 'deck';
    } else if (filenameLower.includes('diagram') || filenameLower.includes('framework')) {
      assetType = 'diagram';
    }
    
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        title,
        description: description || `Document: ${title}`,
        content: extractedText || `[PDF Document: ${title}]`,
        type: assetType,
        pdf_url: pdfUrl,
        metadata: {
          source_file: filename,
          has_text: extractedText.length > 100,
          ingested_at: new Date().toISOString(),
        }
      })
      .select()
      .single();

    if (assetError) {
      throw new Error(`Asset creation failed: ${assetError.message}`);
    }

    console.log(`   📝 Created asset: "${title}"`);

    // 5. Create embeddings (if we have text)
    if (extractedText.length > 100) {
      const chunks = chunkText(extractedText);
      console.log(`   🧠 Creating ${chunks.length} embeddings...`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await createEmbedding(chunk);

        await supabase.from('asset_embeddings').insert({
          asset_id: asset.id,
          chunk_text: chunk,
          embedding,
          chunk_index: i
        });

        // Progress indicator
        if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
          process.stdout.write(`\r   🧠 Created ${i + 1}/${chunks.length} embeddings`);
        }
      }
      console.log(''); // New line after progress
    } else {
      console.log(`   ⚠️  No text extracted - PDF will display but won't be searchable`);
    }

    console.log(`   ✅ Complete!`);
    return { success: true, title, pdfUrl };

  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function ingestDirectory(dirPath) {
  console.log('\n📁 INGEST NEW PDFs\n');
  console.log('═'.repeat(50));

  // Check directory exists
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    process.exit(1);
  }

  // Find all PDFs
  const files = fs.readdirSync(dirPath)
    .filter(f => f.toLowerCase().endsWith('.pdf'));

  if (files.length === 0) {
    console.error('❌ No PDF files found in directory');
    process.exit(1);
  }

  console.log(`Found ${files.length} PDF files\n`);

  // Process each PDF
  const results = { success: 0, failed: 0, errors: [] };

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = await ingestPdf(filePath);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({ file, error: result.error });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('SUMMARY');
  console.log('═'.repeat(50));
  console.log(`✅ Successfully ingested: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nFailed files:');
    results.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }

  // Final verification
  const { count: assetCount } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true });

  const { count: embeddingCount } = await supabase
    .from('asset_embeddings')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Database now has:`);
  console.log(`   ${assetCount} assets`);
  console.log(`   ${embeddingCount} embeddings`);
  
  console.log(`\n🎉 Done! Your PDFs are ready to search.`);
}

// ============================================
// CLI
// ============================================

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
📁 Ingest New PDFs

USAGE:
  node scripts/ingest-new-pdfs.js <directory>

EXAMPLE:
  node scripts/ingest-new-pdfs.js ./content/

This will:
1. Upload each PDF to Supabase Storage
2. Extract text for search
3. Create embeddings
4. Link the PDF URL for viewing
`);
  process.exit(0);
}

ingestDirectory(args[0]).catch(console.error);
