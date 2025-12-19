/**
 * Fix Case Study PDF Links - Proper Matching
 * 
 * This script clears incorrect links and re-matches using strict matching.
 * 
 * Run: node scripts/fix-case-study-links.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Known case studies and their EXACT PDF file patterns
const CASE_STUDY_MAPPINGS = [
  {
    titlePattern: /crowdstrike/i,
    filePattern: /crowdstrike/i,
    client: 'CrowdStrike'
  },
  {
    titlePattern: /amazon|aws|flagship.*thought.*leadership/i,
    filePattern: /amazon|flagship.*thought.*leadership/i,
    client: 'Amazon'
  },
  {
    titlePattern: /google|powerful.*digital.*ecosystem/i,
    filePattern: /creating.*most.*powerful|ecosystem.*work/i,
    client: 'Google'
  },
  {
    titlePattern: /science|rebranding.*basic.*science/i,
    filePattern: /science|rebranding.*basic/i,
    client: 'Science'
  }
];

async function fixCaseStudyLinks() {
  console.log('\n🔧 Fix Case Study PDF Links\n');
  console.log('═'.repeat(60));

  // Step 1: Get all files from storage
  console.log('\n1. Fetching PDFs from storage...');
  
  const { data: files, error: storageError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  if (storageError) {
    console.error('Storage error:', storageError.message);
    return;
  }

  console.log(`   Found ${files.length} files\n`);

  // List case study related files
  console.log('   Case study PDFs in storage:');
  const caseStudyFiles = files.filter(f => 
    f.name.toLowerCase().includes('work') ||
    f.name.toLowerCase().includes('crowdstrike') ||
    f.name.toLowerCase().includes('amazon') ||
    f.name.toLowerCase().includes('science') ||
    f.name.toLowerCase().includes('ecosystem') ||
    f.name.toLowerCase().includes('flagship')
  );
  
  caseStudyFiles.forEach(f => {
    console.log(`   - ${f.name}`);
  });

  // Step 2: Get all assets
  console.log('\n2. Fetching assets...');
  
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*');

  if (assetsError) {
    console.error('Assets error:', assetsError.message);
    return;
  }

  console.log(`   Found ${assets.length} assets\n`);

  // Step 3: Identify case studies
  const caseStudies = assets.filter(a => 
    a.metadata?.is_case_study ||
    a.client ||
    CASE_STUDY_MAPPINGS.some(m => m.titlePattern.test(a.title))
  );

  console.log(`   Identified ${caseStudies.length} case studies:\n`);
  caseStudies.forEach(cs => {
    console.log(`   - "${cs.title}" (Client: ${cs.client || 'N/A'})`);
    console.log(`     Current PDF: ${cs.pdf_url ? 'Yes' : 'No'}`);
    if (cs.pdf_url) {
      console.log(`     URL: ...${cs.pdf_url.split('/').pop()}`);
    }
  });

  // Step 4: Clear existing pdf_url for case studies to start fresh
  console.log('\n3. Clearing existing case study PDF links...');
  
  for (const cs of caseStudies) {
    await supabase
      .from('assets')
      .update({ pdf_url: null })
      .eq('id', cs.id);
  }
  console.log('   Done\n');

  // Step 5: Re-link using strict matching
  console.log('4. Re-linking with strict matching...\n');

  for (const cs of caseStudies) {
    const title = cs.title.toLowerCase();
    let matchedFile = null;
    let matchReason = '';

    // Try known mappings first
    for (const mapping of CASE_STUDY_MAPPINGS) {
      if (mapping.titlePattern.test(cs.title)) {
        matchedFile = files.find(f => mapping.filePattern.test(f.name));
        if (matchedFile) {
          matchReason = `Known mapping: ${mapping.client}`;
          break;
        }
      }
    }

    // Try source_file from metadata
    if (!matchedFile && cs.metadata?.source_file) {
      const sourceFile = cs.metadata.source_file
        .toLowerCase()
        .replace('.pdf', '')
        .replace(/_/g, '-');
      
      matchedFile = files.find(f => {
        const storageName = f.name.toLowerCase();
        return storageName.includes(sourceFile) || 
               sourceFile.split('-').filter(w => w.length > 4).every(w => storageName.includes(w));
      });
      
      if (matchedFile) {
        matchReason = `Source file: ${cs.metadata.source_file}`;
      }
    }

    // Try exact title words (require 3+ word matches for case studies)
    if (!matchedFile) {
      const titleWords = title
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['the', 'and', 'for', 'with'].includes(w));

      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const matchedWords = titleWords.filter(w => fileName.includes(w));
        
        // Require at least 3 matching words OR 60% of words for case studies
        const threshold = Math.max(3, Math.ceil(titleWords.length * 0.6));
        
        if (matchedWords.length >= threshold) {
          matchedFile = file;
          matchReason = `Title match: ${matchedWords.length}/${titleWords.length} words`;
          break;
        }
      }
    }

    if (matchedFile) {
      const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${matchedFile.name}`;
      
      const { error: updateError } = await supabase
        .from('assets')
        .update({ pdf_url: pdfUrl })
        .eq('id', cs.id);

      if (updateError) {
        console.log(`   ❌ "${cs.title}": ${updateError.message}`);
      } else {
        console.log(`   ✅ "${cs.title}"`);
        console.log(`      → ${matchedFile.name}`);
        console.log(`      Reason: ${matchReason}\n`);
      }
    } else {
      console.log(`   ⚠️  "${cs.title}": No match found\n`);
    }
  }

  // Step 6: Now link all OTHER assets (non-case studies)
  console.log('\n5. Linking remaining assets...\n');

  const nonCaseStudies = assets.filter(a => !caseStudies.includes(a));
  let linkedCount = 0;

  for (const asset of nonCaseStudies) {
    if (asset.pdf_url) continue; // Skip if already has URL

    let matchedFile = null;

    // Try source_file
    if (asset.metadata?.source_file) {
      const sourceFile = asset.metadata.source_file
        .toLowerCase()
        .replace('.pdf', '')
        .replace(/_/g, '-');
      
      matchedFile = files.find(f => f.name.toLowerCase().includes(sourceFile));
    }

    // Try title matching (less strict for non-case studies)
    if (!matchedFile) {
      const titleWords = asset.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);

      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const matchedWords = titleWords.filter(w => fileName.includes(w));
        
        if (matchedWords.length >= 2) {
          matchedFile = file;
          break;
        }
      }
    }

    if (matchedFile) {
      const pdfUrl = `${SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${matchedFile.name}`;
      
      await supabase
        .from('assets')
        .update({ pdf_url: pdfUrl })
        .eq('id', asset.id);
      
      linkedCount++;
    }
  }

  console.log(`   Linked ${linkedCount} additional assets\n`);

  // Final summary
  console.log('═'.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('═'.repeat(60));

  const { data: finalAssets } = await supabase
    .from('assets')
    .select('id, title, pdf_url, client');

  const withPdf = finalAssets?.filter(a => a.pdf_url) || [];
  const withoutPdf = finalAssets?.filter(a => !a.pdf_url) || [];

  console.log(`\n✅ Assets with PDF: ${withPdf.length}/${finalAssets?.length}`);
  console.log(`❌ Assets without PDF: ${withoutPdf.length}`);

  if (withoutPdf.length > 0 && withoutPdf.length <= 10) {
    console.log('\nMissing PDFs:');
    withoutPdf.forEach(a => console.log(`  - ${a.title}`));
  }

  // Show case study final state
  console.log('\n📊 Case Study Status:');
  const finalCaseStudies = finalAssets?.filter(a => 
    a.client || 
    CASE_STUDY_MAPPINGS.some(m => m.titlePattern.test(a.title))
  ) || [];

  finalCaseStudies.forEach(cs => {
    const status = cs.pdf_url ? '✅' : '❌';
    console.log(`  ${status} ${cs.title}`);
    if (cs.pdf_url) {
      console.log(`     → ${cs.pdf_url.split('/').pop()}`);
    }
  });
}

fixCaseStudyLinks().catch(console.error);
