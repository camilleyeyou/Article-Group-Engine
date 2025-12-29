/**
 * Fix Missing PDF Links - Manual fix for the 2 assets that failed
 * 
 * Run: node scripts/fix-missing-pdfs.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function fixMissingPdfs() {
  console.log('\n🔧 FIX MISSING PDF LINKS\n');

  // Get all storage files to find the right ones
  const { data: files } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  console.log(`Found ${files.length} PDFs in storage\n`);

  // Find the matching PDFs for the 2 missing assets
  const missingAssets = [
    {
      id: '0aa84a09-29d8-4fe2-bc65-5962a42183d1',
      title: 'Stonewall Pride Movement Strategy Social Change LGBTQ History',
      searchTerms: ['stonewall', 'pride', 'lgbtq']
    },
    {
      id: '9b87be96-0c36-4685-83c9-37a6aee6f2f2',
      title: 'Virtual Keynote Content Strategy Event Rethinking',
      searchTerms: ['virtual', 'keynote', 'event']
    }
  ];

  for (const asset of missingAssets) {
    console.log(`Looking for PDF for: "${asset.title}"`);
    
    // Find matching PDF
    const matchingPdf = files.find(f => {
      const filename = f.name.toLowerCase();
      return asset.searchTerms.some(term => filename.includes(term));
    });

    if (matchingPdf) {
      const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${matchingPdf.name}`;
      
      const { error } = await supabase
        .from('assets')
        .update({ pdf_url: pdfUrl })
        .eq('id', asset.id);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Linked to: ${matchingPdf.name}`);
      }
    } else {
      console.log(`   ⚠️  No matching PDF found in storage`);
      console.log(`   Available PDFs containing similar terms:`);
      
      // Show possible matches
      const possibleMatches = files.filter(f => {
        const filename = f.name.toLowerCase();
        return asset.searchTerms.some(term => 
          filename.includes(term.substring(0, 4))
        );
      });
      
      if (possibleMatches.length > 0) {
        possibleMatches.forEach(p => console.log(`      - ${p.name}`));
      } else {
        console.log(`      (none found)`);
      }
    }
    console.log('');
  }

  // Final check
  const { data: check } = await supabase
    .from('assets')
    .select('id, title, pdf_url')
    .is('pdf_url', null);

  console.log('─'.repeat(50));
  console.log(`\nAssets still without PDF: ${check?.length || 0}`);
  
  if (check && check.length > 0) {
    check.forEach(a => console.log(`   - ${a.title}`));
  }
}

fixMissingPdfs().catch(console.error);
