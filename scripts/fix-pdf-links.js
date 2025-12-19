/**
 * Fix PDF Links - Match all storage PDFs to assets
 * 
 * This script:
 * 1. Lists all PDFs in Supabase Storage
 * 2. Lists all assets in database
 * 3. Matches them using fuzzy matching
 * 4. Updates all assets with correct pdf_url
 * 
 * Run: node scripts/fix-pdf-links.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Normalize text for matching
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity between two strings
function similarity(str1, str2) {
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  const words1 = s1.split(' ').filter(w => w.length > 2);
  const words2 = s2.split(' ').filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

// Extract meaningful name from PDF filename
function extractNameFromFilename(filename) {
  return filename
    .replace(/^\d+-/, '') // Remove timestamp prefix
    .replace(/\.pdf$/i, '') // Remove .pdf extension
    .replace(/articlegroup-com-/g, '') // Remove common prefix
    .replace(/-/g, ' ') // Replace dashes with spaces
    .trim();
}

async function fixPDFLinks() {
  console.log('\n🔧 Fix PDF Links\n');
  console.log('═'.repeat(60));

  // Step 1: Get all PDFs from storage
  console.log('\n1. Fetching PDFs from storage...');
  
  const { data: files, error: storageError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  if (storageError) {
    console.error('Storage error:', storageError.message);
    return;
  }

  console.log(`   Found ${files.length} PDFs in storage`);

  // Build PDF URL map
  const pdfMap = files.map(f => ({
    filename: f.name,
    name: extractNameFromFilename(f.name),
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${f.name}`
  }));

  // Step 2: Get all assets
  console.log('\n2. Fetching assets from database...');
  
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('id, title, pdf_url');

  if (assetsError) {
    console.error('Assets error:', assetsError.message);
    return;
  }

  console.log(`   Found ${assets.length} assets`);

  // Step 3: Match and update
  console.log('\n3. Matching PDFs to assets...\n');
  
  let updated = 0;
  let alreadyLinked = 0;
  let notFound = 0;
  const unmatched = [];

  for (const asset of assets) {
    // Skip if already has a valid pdf_url
    if (asset.pdf_url) {
      alreadyLinked++;
      continue;
    }

    // Find best matching PDF
    let bestMatch = null;
    let bestScore = 0;

    for (const pdf of pdfMap) {
      const score = similarity(asset.title, pdf.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pdf;
      }
    }

    if (bestMatch && bestScore > 0.3) {
      // Update asset with PDF URL
      const { error: updateError } = await supabase
        .from('assets')
        .update({ pdf_url: bestMatch.url })
        .eq('id', asset.id);

      if (updateError) {
        console.log(`   ❌ Failed to update "${asset.title}": ${updateError.message}`);
      } else {
        console.log(`   ✅ Linked: "${asset.title}"`);
        console.log(`      → ${bestMatch.name} (${Math.round(bestScore * 100)}% match)`);
        updated++;
      }
    } else {
      notFound++;
      unmatched.push(asset.title);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`
✅ Already linked:  ${alreadyLinked}
✅ Newly linked:    ${updated}
❌ No match found:  ${notFound}
─────────────────────
   Total assets:    ${assets.length}
  `);

  if (unmatched.length > 0 && unmatched.length <= 20) {
    console.log('Unmatched assets:');
    unmatched.forEach(t => console.log(`  - ${t}`));
  }
}

fixPDFLinks().catch(console.error);
