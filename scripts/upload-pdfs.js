/**
 * Upload PDFs to Supabase Storage and Link to Existing Assets
 * 
 * Usage:
 *   node scripts/upload-pdfs.js ./content/pdfs/
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STORAGE_BUCKET = 'pdfs';

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
    .trim();
}

// ============================================
// STORAGE OPERATIONS
// ============================================

async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET);
  
  if (!bucketExists) {
    console.log(`Creating storage bucket: ${STORAGE_BUCKET}`);
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/pdf'],
    });
    
    if (error && !error.message.includes('already exists')) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }
}

async function uploadPDF(pdfPath) {
  const filename = path.basename(pdfPath);
  const sanitized = sanitizeFilename(filename);
  const storagePath = `documents/${Date.now()}-${sanitized}`;
  
  const fileBuffer = fs.readFileSync(pdfPath);
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);
  
  return urlData.publicUrl;
}

// ============================================
// MATCHING LOGIC
// ============================================

async function findMatchingAsset(filename) {
  const searchTitle = extractTitleFromFilename(filename);
  
  // Try exact match first
  const { data: exactMatch } = await supabase
    .from('assets')
    .select('id, title')
    .ilike('title', searchTitle)
    .is('pdf_url', null)
    .limit(1)
    .single();
  
  if (exactMatch) return exactMatch;
  
  // Try fuzzy match - search for assets containing parts of the filename
  const words = searchTitle.split(' ').filter(w => w.length > 3);
  
  for (const word of words) {
    const { data: fuzzyMatch } = await supabase
      .from('assets')
      .select('id, title')
      .ilike('title', `%${word}%`)
      .is('pdf_url', null)
      .limit(1)
      .single();
    
    if (fuzzyMatch) return fuzzyMatch;
  }
  
  return null;
}

async function updateAssetWithPdfUrl(assetId, pdfUrl) {
  const { error } = await supabase
    .from('assets')
    .update({ pdf_url: pdfUrl })
    .eq('id', assetId);
  
  if (error) {
    throw new Error(`Failed to update asset: ${error.message}`);
  }
}

// ============================================
// MAIN
// ============================================

async function uploadAndLinkPDFs(directory) {
  console.log('\n📄 PDF Upload & Link Script');
  console.log('═'.repeat(50));
  
  // Verify directory exists
  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}`);
    process.exit(1);
  }
  
  // Find all PDFs
  const files = fs.readdirSync(directory)
    .filter(f => f.toLowerCase().endsWith('.pdf'));
  
  if (files.length === 0) {
    console.error('❌ No PDF files found in directory');
    process.exit(1);
  }
  
  console.log(`Found ${files.length} PDF files\n`);
  
  // Ensure bucket exists
  await ensureBucketExists();
  
  // Process each PDF
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    console.log(`\n📎 Processing: ${file}`);
    
    try {
      // 1. Find matching asset
      const asset = await findMatchingAsset(file);
      
      if (!asset) {
        console.log(`   ⚠️  No matching asset found - uploading anyway`);
        
        // Upload anyway, we'll link manually later
        const pdfUrl = await uploadPDF(filePath);
        console.log(`   ✅ Uploaded: ${pdfUrl}`);
        results.push({ file, status: 'uploaded_no_match', url: pdfUrl });
        continue;
      }
      
      console.log(`   🔗 Matched to: "${asset.title}"`);
      
      // 2. Upload PDF
      const pdfUrl = await uploadPDF(filePath);
      console.log(`   ☁️  Uploaded to storage`);
      
      // 3. Update asset
      await updateAssetWithPdfUrl(asset.id, pdfUrl);
      console.log(`   ✅ Linked to asset`);
      
      results.push({ file, status: 'success', asset: asset.title, url: pdfUrl });
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log(`   ❌ Failed: ${message}`);
      results.push({ file, status: 'failed', asset: message });
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('SUMMARY');
  console.log('═'.repeat(50));
  
  const successful = results.filter(r => r.status === 'success');
  const noMatch = results.filter(r => r.status === 'uploaded_no_match');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`✅ Successfully linked: ${successful.length}`);
  console.log(`⚠️  Uploaded but no match: ${noMatch.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (noMatch.length > 0) {
    console.log('\n📋 PDFs uploaded without matching assets:');
    console.log('   (You can manually link these in Supabase)\n');
    noMatch.forEach(r => {
      console.log(`   File: ${r.file}`);
      console.log(`   URL:  ${r.url}\n`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed uploads:');
    failed.forEach(r => console.log(`   - ${r.file}: ${r.asset}`));
  }
  
  // Show SQL for manual linking if needed
  if (noMatch.length > 0) {
    console.log('\n📝 To manually link PDFs, run in Supabase SQL Editor:');
    console.log('─'.repeat(50));
    noMatch.forEach(r => {
      console.log(`
UPDATE assets 
SET pdf_url = '${r.url}'
WHERE title ILIKE '%YOUR_ASSET_TITLE%';
`);
    });
  }
}

// ============================================
// CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📄 Upload PDFs to Supabase Storage

USAGE:
  node scripts/upload-pdfs.js <pdf-directory>

EXAMPLE:
  node scripts/upload-pdfs.js ./content/pdfs/

This script will:
1. Upload all PDFs to Supabase Storage
2. Try to match each PDF to an existing asset by filename
3. Update the asset's pdf_url so it displays the original PDF
`);
    process.exit(0);
  }
  
  await uploadAndLinkPDFs(args[0]);
}

main().catch(console.error);
