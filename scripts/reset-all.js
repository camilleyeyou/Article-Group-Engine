/**
 * RESET DATABASE AND STORAGE
 * 
 * This script:
 * 1. Deletes all embeddings
 * 2. Deletes all assets
 * 3. Clears all PDFs from storage
 * 
 * Run: node scripts/reset-all.js
 * 
 * WARNING: This is destructive! All data will be lost.
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function confirmReset() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\n⚠️  WARNING: This will DELETE ALL DATA!\n\nType "RESET" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'RESET');
    });
  });
}

async function resetAll() {
  console.log('\n🗑️  DATABASE & STORAGE RESET\n');
  console.log('═'.repeat(50));

  // Confirm
  const confirmed = await confirmReset();
  if (!confirmed) {
    console.log('\n❌ Reset cancelled.\n');
    process.exit(0);
  }

  console.log('\n✓ Confirmed. Starting reset...\n');

  // Step 1: Delete all embeddings
  console.log('1. Deleting embeddings...');
  const { error: embeddingsError, count: embeddingsCount } = await supabase
    .from('embeddings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    .select('*', { count: 'exact', head: true });

  if (embeddingsError) {
    console.log(`   ⚠️  Error: ${embeddingsError.message}`);
  } else {
    console.log(`   ✓ Deleted embeddings`);
  }

  // Step 2: Delete all assets
  console.log('2. Deleting assets...');
  const { error: assetsError } = await supabase
    .from('assets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (assetsError) {
    console.log(`   ⚠️  Error: ${assetsError.message}`);
  } else {
    console.log(`   ✓ Deleted assets`);
  }

  // Step 3: Clear storage bucket
  console.log('3. Clearing storage...');
  
  // List all files in the bucket
  const { data: files, error: listError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 1000 });

  if (listError) {
    console.log(`   ⚠️  Error listing files: ${listError.message}`);
  } else if (files && files.length > 0) {
    // Delete all files
    const filePaths = files.map(f => `documents/${f.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from('pdfs')
      .remove(filePaths);

    if (deleteError) {
      console.log(`   ⚠️  Error deleting files: ${deleteError.message}`);
    } else {
      console.log(`   ✓ Deleted ${files.length} files from storage`);
    }
  } else {
    console.log('   ✓ Storage already empty');
  }

  // Verify
  console.log('\n4. Verifying...');
  
  const { count: assetCount } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true });

  const { count: embeddingCount } = await supabase
    .from('embeddings')
    .select('*', { count: 'exact', head: true });

  const { data: remainingFiles } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 10 });

  console.log(`   Assets: ${assetCount || 0}`);
  console.log(`   Embeddings: ${embeddingCount || 0}`);
  console.log(`   Storage files: ${remainingFiles?.length || 0}`);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('✅ RESET COMPLETE');
  console.log('═'.repeat(50));
  console.log(`
Next steps:
1. Put your new PDF files in ./content/
2. Run: node scripts/ingest-new-pdfs.js ./content/

This will:
- Upload each PDF to storage
- Extract text for search
- Create embeddings
- Link the PDF URL automatically
`);
}

resetAll().catch(console.error);
