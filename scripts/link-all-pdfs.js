/**
 * Link ALL PDFs using source_file metadata
 * 
 * This matches each asset to its PDF using the source_file in metadata.
 * 
 * Run: node scripts/link-all-pdfs.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Normalize filename for matching
function normalizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace('.pdf', '')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function linkAllPdfs() {
  console.log('\n🔗 Link ALL PDFs Using Source File\n');
  console.log('═'.repeat(60));

  // Get all storage files
  const { data: files, error: storageError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  if (storageError) {
    console.error('Storage error:', storageError.message);
    return;
  }

  console.log(`📁 Found ${files.length} PDFs in storage\n`);

  // Create normalized lookup map
  const fileMap = new Map();
  files.forEach(f => {
    // Remove timestamp prefix and normalize
    const nameWithoutTimestamp = f.name.replace(/^\d+-/, '');
    const normalized = normalizeFilename(nameWithoutTimestamp);
    fileMap.set(normalized, f.name);
    
    // Also add with common variations
    const withoutArticlegroup = normalized.replace('articlegroup-com-', '');
    fileMap.set(withoutArticlegroup, f.name);
  });

  // Get all assets
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*');

  if (assetsError) {
    console.error('Assets error:', assetsError.message);
    return;
  }

  console.log(`📊 Found ${assets.length} assets\n`);
  console.log('─'.repeat(60));

  let linked = 0;
  let alreadyLinked = 0;
  let notFound = [];

  for (const asset of assets) {
    // Skip if already has correct pdf_url
    if (asset.pdf_url && asset.pdf_url.includes('supabase')) {
      alreadyLinked++;
      continue;
    }

    let matchedFile = null;
    let matchMethod = '';

    // Method 1: Use source_file from metadata
    if (asset.metadata?.source_file) {
      const sourceNormalized = normalizeFilename(asset.metadata.source_file);
      
      // Try exact match
      if (fileMap.has(sourceNormalized)) {
        matchedFile = fileMap.get(sourceNormalized);
        matchMethod = 'source_file exact';
      }
      
      // Try without articlegroup prefix
      if (!matchedFile) {
        const withoutPrefix = sourceNormalized.replace('articlegroup-com-', '');
        if (fileMap.has(withoutPrefix)) {
          matchedFile = fileMap.get(withoutPrefix);
          matchMethod = 'source_file without prefix';
        }
      }

      // Try partial match
      if (!matchedFile) {
        for (const [normalized, filename] of fileMap) {
          if (normalized.includes(sourceNormalized) || sourceNormalized.includes(normalized)) {
            matchedFile = filename;
            matchMethod = 'source_file partial';
            break;
          }
        }
      }
    }

    // Method 2: Try title-based matching
    if (!matchedFile) {
      const titleNormalized = normalizeFilename(asset.title);
      
      for (const [normalized, filename] of fileMap) {
        // Check if all significant words from title are in filename
        const titleWords = titleNormalized.split('-').filter(w => w.length > 3);
        const matchedWords = titleWords.filter(w => normalized.includes(w));
        
        if (matchedWords.length >= Math.ceil(titleWords.length * 0.7)) {
          matchedFile = filename;
          matchMethod = 'title match';
          break;
        }
      }
    }

    if (matchedFile) {
      const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${matchedFile}`;
      
      const { error: updateError } = await supabase
        .from('assets')
        .update({ pdf_url: pdfUrl })
        .eq('id', asset.id);

      if (updateError) {
        console.log(`❌ "${asset.title}": ${updateError.message}`);
      } else {
        console.log(`✅ "${asset.title}"`);
        console.log(`   → ${matchedFile} (${matchMethod})`);
        linked++;
      }
    } else {
      notFound.push({
        title: asset.title,
        sourceFile: asset.metadata?.source_file || 'N/A'
      });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Newly linked: ${linked}`);
  console.log(`⏭️  Already linked: ${alreadyLinked}`);
  console.log(`❌ Not found: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log('\n📋 Assets without matching PDF:');
    notFound.forEach(a => {
      console.log(`   - "${a.title}"`);
      console.log(`     Source: ${a.sourceFile}`);
    });
  }

  // Final count
  const { data: finalCheck } = await supabase
    .from('assets')
    .select('id, pdf_url');

  const withPdf = finalCheck?.filter(a => a.pdf_url).length || 0;
  console.log(`\n📊 Final: ${withPdf}/${finalCheck?.length} assets have PDFs`);
}

linkAllPdfs().catch(console.error);
