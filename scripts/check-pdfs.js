/**
 * Diagnostic: Check PDF linking status
 * 
 * Run: node scripts/check-pdfs.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPDFStatus() {
  console.log('\n📊 PDF Linking Diagnostic\n');
  console.log('═'.repeat(60));

  // Get all assets
  const { data: assets, error } = await supabase
    .from('assets')
    .select('id, title, pdf_url, metadata')
    .order('title');

  if (error) {
    console.error('Error fetching assets:', error.message);
    return;
  }

  console.log(`Total assets: ${assets.length}\n`);

  const withPdf = assets.filter(a => a.pdf_url);
  const withoutPdf = assets.filter(a => !a.pdf_url);

  console.log(`✅ With pdf_url: ${withPdf.length}`);
  console.log(`❌ Without pdf_url: ${withoutPdf.length}\n`);

  if (withoutPdf.length > 0) {
    console.log('─'.repeat(60));
    console.log('Assets WITHOUT pdf_url:\n');
    withoutPdf.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`);
      console.log(`   ID: ${a.id}`);
      if (a.metadata?.source_file) {
        console.log(`   Source file: ${a.metadata.source_file}`);
      }
      console.log('');
    });
  }

  // Check storage bucket
  console.log('─'.repeat(60));
  console.log('\n📁 Checking Storage Bucket...\n');

  const { data: files, error: storageError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 100 });

  if (storageError) {
    console.log('Storage error:', storageError.message);
  } else {
    console.log(`Files in storage: ${files?.length || 0}`);
    
    if (files && files.length > 0) {
      console.log('\nFirst 10 files:');
      files.slice(0, 10).forEach(f => {
        console.log(`  - ${f.name}`);
      });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`
Assets with PDF linked:    ${withPdf.length} / ${assets.length} (${Math.round(withPdf.length / assets.length * 100)}%)
Assets missing PDF link:   ${withoutPdf.length}
Files in storage bucket:   ${files?.length || 0}

${withoutPdf.length > 0 ? '⚠️  Some assets need PDF URLs linked!' : '✅ All assets have PDFs linked!'}
  `);
}

checkPDFStatus().catch(console.error);
