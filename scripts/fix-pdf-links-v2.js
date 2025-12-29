/**
 * Fix PDF Links - Relink PDFs using source_file metadata
 * 
 * Run: node scripts/fix-pdf-links-v2.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function normalizeForMatching(str) {
  return str
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/^articlegroup(com)?/, '')
    .replace(/^\d+/, ''); // Remove timestamp prefix
}

function calculateMatchScore(str1, str2) {
  const norm1 = normalizeForMatching(str1);
  const norm2 = normalizeForMatching(str2);
  
  // Exact match
  if (norm1 === norm2) return 100;
  
  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 80;
  
  // Word matching
  const words1 = norm1.match(/[a-z]{3,}/g) || [];
  const words2 = norm2.match(/[a-z]{3,}/g) || [];
  
  const matchingWords = words1.filter(w => words2.includes(w));
  const matchRatio = matchingWords.length / Math.max(words1.length, words2.length);
  
  return Math.round(matchRatio * 100);
}

async function fixPdfLinks() {
  console.log('\n🔧 FIX PDF LINKS\n');
  console.log('═'.repeat(70));

  // Get all storage files
  const { data: files, error: storageError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  if (storageError) {
    console.error('Storage error:', storageError.message);
    return;
  }

  console.log(`📁 Found ${files.length} PDFs in storage\n`);

  // Get all assets
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*');

  if (assetsError) {
    console.error('Assets error:', assetsError.message);
    return;
  }

  console.log(`📊 Found ${assets.length} assets\n`);
  console.log('─'.repeat(70));

  // Clear all PDF links first
  console.log('\n1️⃣  Clearing existing PDF links...');
  await supabase
    .from('assets')
    .update({ pdf_url: null })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('   ✓ Cleared\n');

  // Match each asset to best PDF
  console.log('2️⃣  Matching assets to PDFs...\n');
  
  const usedPdfs = new Set();
  const results = { matched: 0, unmatched: 0 };
  const unmatchedAssets = [];

  for (const asset of assets) {
    const sourceFile = asset.metadata?.source_file || asset.title;
    
    // Find best matching PDF
    let bestMatch = null;
    let bestScore = 0;
    
    for (const file of files) {
      if (usedPdfs.has(file.name)) continue; // Already used
      
      const score = calculateMatchScore(sourceFile, file.name);
      
      // Also check against title
      const titleScore = calculateMatchScore(asset.title, file.name);
      const finalScore = Math.max(score, titleScore);
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatch = file.name;
      }
    }
    
    if (bestMatch && bestScore >= 50) {
      // Update asset with PDF URL
      const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${bestMatch}`;
      
      const { error: updateError } = await supabase
        .from('assets')
        .update({ pdf_url: pdfUrl })
        .eq('id', asset.id);
      
      if (updateError) {
        console.log(`   ❌ ${asset.title.substring(0, 40)}: ${updateError.message}`);
      } else {
        console.log(`   ✅ [${bestScore}%] ${asset.title.substring(0, 40)}`);
        usedPdfs.add(bestMatch);
        results.matched++;
      }
    } else {
      console.log(`   ⚠️  No match: ${asset.title.substring(0, 40)}`);
      unmatchedAssets.push(asset);
      results.unmatched++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  console.log(`✅ Matched: ${results.matched}`);
  console.log(`⚠️  Unmatched: ${results.unmatched}`);
  console.log(`📁 PDFs used: ${usedPdfs.size}/${files.length}`);

  if (unmatchedAssets.length > 0) {
    console.log('\n📋 UNMATCHED ASSETS:');
    unmatchedAssets.forEach(a => {
      console.log(`   - ${a.title}`);
      console.log(`     Source: ${a.metadata?.source_file || 'N/A'}`);
    });
  }

  // Final verification
  const { data: finalCheck } = await supabase
    .from('assets')
    .select('id, pdf_url');

  const withPdf = finalCheck?.filter(a => a.pdf_url).length || 0;
  console.log(`\n📊 Final: ${withPdf}/${assets.length} assets have PDFs linked`);
}

fixPdfLinks().catch(console.error);
