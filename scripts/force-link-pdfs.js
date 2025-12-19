/**
 * Direct Fix: Force link case study PDFs
 * 
 * This uses the exact file names from your content folder
 * to directly update the database.
 * 
 * Run: node scripts/force-link-pdfs.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function forceLink() {
  console.log('\n🔧 Force Link PDFs\n');
  console.log('═'.repeat(60));

  // Get all files from storage first
  const { data: files, error: storageError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  if (storageError) {
    console.error('Storage error:', storageError.message);
    return;
  }

  console.log(`Found ${files.length} files in storage\n`);

  // Build URL lookup by partial name
  const findPdfUrl = (searchTerm) => {
    const file = files.find(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (file) {
      return `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${file.name}`;
    }
    return null;
  };

  // Get all assets
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*');

  if (assetsError) {
    console.error('Assets error:', assetsError.message);
    return;
  }

  console.log(`Found ${assets.length} assets\n`);
  console.log('─'.repeat(60));

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const asset of assets) {
    // Skip if already has a working pdf_url
    if (asset.pdf_url) {
      skipped++;
      continue;
    }

    // Try to find matching PDF based on source_file in metadata
    let pdfUrl = null;
    
    if (asset.metadata?.source_file) {
      const sourceFile = asset.metadata.source_file
        .replace('.pdf', '')
        .replace(/_/g, '-')
        .toLowerCase();
      
      // Search for this file in storage
      const matchingFile = files.find(f => {
        const storageName = f.name.toLowerCase();
        // Try exact match first
        if (storageName.includes(sourceFile)) return true;
        // Try partial match
        const sourceWords = sourceFile.split('-').filter(w => w.length > 3);
        const matchCount = sourceWords.filter(w => storageName.includes(w)).length;
        return matchCount >= Math.min(3, sourceWords.length);
      });

      if (matchingFile) {
        pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${matchingFile.name}`;
      }
    }

    // If no match from source_file, try title matching
    if (!pdfUrl) {
      const titleWords = asset.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);

      const matchingFile = files.find(f => {
        const storageName = f.name.toLowerCase();
        const matchCount = titleWords.filter(w => storageName.includes(w)).length;
        return matchCount >= Math.min(2, titleWords.length);
      });

      if (matchingFile) {
        pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${matchingFile.name}`;
      }
    }

    if (pdfUrl) {
      const { error: updateError } = await supabase
        .from('assets')
        .update({ pdf_url: pdfUrl })
        .eq('id', asset.id);

      if (updateError) {
        console.log(`❌ ${asset.title}: ${updateError.message}`);
        failed++;
      } else {
        console.log(`✅ ${asset.title}`);
        console.log(`   → ${pdfUrl.split('/').pop()}`);
        updated++;
      }
    } else {
      console.log(`⚠️  ${asset.title}: No matching PDF found`);
      if (asset.metadata?.source_file) {
        console.log(`   Source file: ${asset.metadata.source_file}`);
      }
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped (already has PDF): ${skipped}`);
  console.log(`❌ Failed/No match: ${failed}`);

  // Final count
  const { data: finalCheck } = await supabase
    .from('assets')
    .select('id, title, pdf_url');

  const withPdf = finalCheck?.filter(a => a.pdf_url).length || 0;
  const total = finalCheck?.length || 0;

  console.log(`\n📊 Final: ${withPdf}/${total} assets have PDFs (${Math.round(withPdf/total*100)}%)`);

  // Show any remaining without PDFs
  const remaining = finalCheck?.filter(a => !a.pdf_url) || [];
  if (remaining.length > 0 && remaining.length <= 10) {
    console.log('\nStill missing PDFs:');
    remaining.forEach(a => console.log(`  - ${a.title}`));
  }
}

forceLink().catch(console.error);
