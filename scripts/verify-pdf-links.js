/**
 * Verify PDF Links - Check that each asset points to the correct PDF
 * 
 * Run: node scripts/verify-pdf-links.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyPdfLinks() {
  console.log('\n🔍 VERIFY PDF LINKS\n');
  console.log('═'.repeat(70));

  // Get all assets
  const { data: assets, error } = await supabase
    .from('assets')
    .select('id, title, pdf_url, metadata')
    .order('title');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`\nFound ${assets.length} assets\n`);

  // Check each asset
  const issues = [];
  
  for (const asset of assets) {
    const sourceFile = asset.metadata?.source_file || '';
    const pdfUrl = asset.pdf_url || '';
    
    // Extract filename from PDF URL
    const pdfFilename = pdfUrl.split('/').pop() || '';
    
    // Normalize both for comparison
    const normalizedTitle = asset.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedPdf = pdfFilename.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^\d+/, '');
    const normalizedSource = sourceFile.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check if they match
    let status = '✓';
    let issue = null;
    
    if (!pdfUrl) {
      status = '❌';
      issue = 'No PDF URL';
    } else {
      // Check if PDF filename relates to title or source
      const titleWords = normalizedTitle.split(/(?=[A-Z])/).filter(w => w.length > 3);
      const matchingWords = titleWords.filter(w => normalizedPdf.includes(w));
      
      if (matchingWords.length < 2 && normalizedSource && !normalizedPdf.includes(normalizedSource.substring(0, 20))) {
        status = '⚠️';
        issue = 'Possible mismatch';
      }
    }
    
    if (issue) {
      issues.push({
        id: asset.id,
        title: asset.title,
        pdfFilename,
        sourceFile,
        issue
      });
    }
    
    console.log(`${status} ${asset.title.substring(0, 50)}`);
    if (issue) {
      console.log(`   └─ PDF: ${pdfFilename.substring(0, 50)}`);
      console.log(`   └─ Issue: ${issue}`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total assets: ${assets.length}`);
  console.log(`Issues found: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n📋 ASSETS WITH ISSUES:\n');
    issues.forEach((a, i) => {
      console.log(`${i + 1}. "${a.title}"`);
      console.log(`   ID: ${a.id}`);
      console.log(`   PDF: ${a.pdfFilename || 'NONE'}`);
      console.log(`   Issue: ${a.issue}`);
      console.log('');
    });
  }
}

verifyPdfLinks().catch(console.error);
