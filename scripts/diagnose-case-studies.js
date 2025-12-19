/**
 * Diagnose Case Study PDF Links
 * 
 * This shows EXACTLY what's in your database and storage
 * so we can manually fix the mappings.
 * 
 * Run: node scripts/diagnose-case-studies.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
  console.log('\n🔍 CASE STUDY DIAGNOSTIC\n');
  console.log('═'.repeat(70));

  // Get storage files
  const { data: files } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  // Get assets
  const { data: assets } = await supabase
    .from('assets')
    .select('*')
    .order('title');

  // Find case study related PDFs in storage
  console.log('\n📁 CASE STUDY PDFs IN STORAGE:\n');
  
  const workFiles = files.filter(f => 
    f.name.includes('work') ||
    f.name.includes('crowdstrike') ||
    f.name.includes('amazon') ||
    f.name.includes('science') ||
    f.name.includes('ecosystem')
  );

  workFiles.forEach((f, i) => {
    console.log(`${i + 1}. ${f.name}`);
  });

  // Find case study assets in database
  console.log('\n\n📊 CASE STUDY ASSETS IN DATABASE:\n');
  
  const caseStudyAssets = assets.filter(a => 
    a.client ||
    a.metadata?.is_case_study ||
    a.title.toLowerCase().includes('crowdstrike') ||
    a.title.toLowerCase().includes('amazon') ||
    a.title.toLowerCase().includes('flagship') ||
    a.title.toLowerCase().includes('ecosystem') ||
    a.title.toLowerCase().includes('science') ||
    a.title.toLowerCase().includes('digital')
  );

  caseStudyAssets.forEach((a, i) => {
    console.log(`${i + 1}. TITLE: "${a.title}"`);
    console.log(`   ID: ${a.id}`);
    console.log(`   CLIENT: ${a.client || 'N/A'}`);
    console.log(`   SOURCE FILE: ${a.metadata?.source_file || 'N/A'}`);
    console.log(`   CURRENT PDF_URL: ${a.pdf_url ? a.pdf_url.split('/').pop() : 'NONE'}`);
    console.log('');
  });

  // Generate SQL to manually fix
  console.log('\n═'.repeat(70));
  console.log('📝 MANUAL FIX SQL - Run this in Supabase SQL Editor:\n');
  console.log('-- First, clear all case study PDF links');
  
  caseStudyAssets.forEach(a => {
    console.log(`UPDATE assets SET pdf_url = NULL WHERE id = '${a.id}';`);
  });

  console.log('\n-- Then, manually link each one to the CORRECT PDF:');
  console.log('-- (Replace the PDF filenames with the correct ones from the list above)\n');

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  caseStudyAssets.forEach(a => {
    // Try to guess the correct PDF
    let suggestedPdf = 'REPLACE_WITH_CORRECT_PDF_FILENAME';
    
    if (a.title.toLowerCase().includes('crowdstrike')) {
      const match = workFiles.find(f => f.name.includes('crowdstrike'));
      if (match) suggestedPdf = match.name;
    } else if (a.title.toLowerCase().includes('amazon') || a.title.toLowerCase().includes('flagship')) {
      const match = workFiles.find(f => f.name.includes('amazon'));
      if (match) suggestedPdf = match.name;
    } else if (a.title.toLowerCase().includes('ecosystem') || a.title.toLowerCase().includes('powerful')) {
      const match = workFiles.find(f => f.name.includes('ecosystem'));
      if (match) suggestedPdf = match.name;
    } else if (a.title.toLowerCase().includes('science')) {
      const match = workFiles.find(f => f.name.includes('science'));
      if (match) suggestedPdf = match.name;
    }

    console.log(`-- "${a.title}"`);
    console.log(`UPDATE assets SET pdf_url = '${baseUrl}/storage/v1/object/public/pdfs/documents/${suggestedPdf}' WHERE id = '${a.id}';`);
    console.log('');
  });
}

diagnose().catch(console.error);
