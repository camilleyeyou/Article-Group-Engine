/**
 * Clear Storage Only
 * 
 * Run: node scripts/clear-storage.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearStorage() {
  console.log('\n🗑️  Clearing storage...\n');

  const { data: files, error: listError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 1000 });

  if (listError) {
    console.log(`Error listing files: ${listError.message}`);
    return;
  }

  if (!files || files.length === 0) {
    console.log('Storage is already empty');
    return;
  }

  console.log(`Found ${files.length} files to delete...`);

  const filePaths = files.map(f => `documents/${f.name}`);
  
  const { error: deleteError } = await supabase.storage
    .from('pdfs')
    .remove(filePaths);

  if (deleteError) {
    console.log(`Error deleting: ${deleteError.message}`);
  } else {
    console.log(`✅ Deleted ${files.length} files`);
  }
}

clearStorage().catch(console.error);
