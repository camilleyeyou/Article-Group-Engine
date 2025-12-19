/**
 * Manually Link Case Study PDFs
 * 
 * This script specifically targets the case study PDFs that aren't linking properly.
 * It will list all storage files, find the case studies, and force-link them.
 * 
 * Run: node scripts/link-case-studies.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function linkCaseStudies() {
  console.log('\n🔗 Link Case Study PDFs\n');
  console.log('═'.repeat(60));

  // Step 1: Get all storage files
  console.log('\n1. Fetching all PDFs from storage...');
  
  const { data: files, error: storageError } = await supabase.storage
    .from('pdfs')
    .list('documents', { limit: 500 });

  if (storageError) {
    console.error('Storage error:', storageError.message);
    return;
  }

  console.log(`   Found ${files.length} files in storage\n`);

  // Create a map of storage files
  const storageMap = {};
  files.forEach(f => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${f.name}`;
    storageMap[f.name.toLowerCase()] = url;
    
    // Also map by cleaned name
    const cleanName = f.name
      .replace(/^\d+-/, '')
      .replace(/\.pdf$/i, '')
      .toLowerCase();
    storageMap[cleanName] = url;
  });

  // Step 2: Get all assets that are case studies or work items
  console.log('2. Fetching case study assets...');
  
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('id, title, pdf_url, metadata, client');

  if (assetsError) {
    console.error('Assets error:', assetsError.message);
    return;
  }

  // Filter to case studies and work items
  const caseStudies = assets.filter(a => 
    a.metadata?.is_case_study || 
    a.client ||
    a.title.toLowerCase().includes('amazon') ||
    a.title.toLowerCase().includes('crowdstrike') ||
    a.title.toLowerCase().includes('google') ||
    a.title.toLowerCase().includes('science') ||
    a.title.toLowerCase().includes('work')
  );

  console.log(`   Found ${caseStudies.length} potential case studies\n`);

  // Step 3: Show current state
  console.log('3. Current PDF link status:\n');
  
  for (const cs of caseStudies) {
    const status = cs.pdf_url ? '✅' : '❌';
    console.log(`   ${status} ${cs.title}`);
    if (cs.pdf_url) {
      console.log(`      URL: ${cs.pdf_url.substring(0, 80)}...`);
    }
    if (cs.metadata?.source_file) {
      console.log(`      Source: ${cs.metadata.source_file}`);
    }
    console.log('');
  }

  // Step 4: List all work-related PDFs in storage
  console.log('4. Work/Case Study PDFs in storage:\n');
  
  const workPdfs = files.filter(f => 
    f.name.toLowerCase().includes('work') ||
    f.name.toLowerCase().includes('crowdstrike') ||
    f.name.toLowerCase().includes('amazon') ||
    f.name.toLowerCase().includes('science') ||
    f.name.toLowerCase().includes('ecosystem')
  );

  workPdfs.forEach(f => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${f.name}`;
    console.log(`   📄 ${f.name}`);
    console.log(`      ${url}\n`);
  });

  // Step 5: Manual mapping for known case studies
  console.log('5. Attempting to link case studies...\n');

  const manualMappings = [
    {
      titleContains: 'crowdstrike',
      fileContains: 'crowdstrike'
    },
    {
      titleContains: 'amazon',
      fileContains: 'amazon'
    },
    {
      titleContains: 'science',
      fileContains: 'science'
    },
    {
      titleContains: 'digital ecosystem',
      fileContains: 'ecosystem'
    },
    {
      titleContains: 'powerful digital',
      fileContains: 'ecosystem'
    }
  ];

  let linkedCount = 0;

  for (const asset of assets) {
    // Skip if already has valid pdf_url
    if (asset.pdf_url) continue;

    const titleLower = asset.title.toLowerCase();
    
    // Try to find matching PDF
    let matchedUrl = null;

    // First try source_file from metadata
    if (asset.metadata?.source_file) {
      const sourceFile = asset.metadata.source_file.toLowerCase().replace('.pdf', '');
      for (const [key, url] of Object.entries(storageMap)) {
        if (key.includes(sourceFile) || sourceFile.includes(key.replace(/^\d+-/, ''))) {
          matchedUrl = url;
          break;
        }
      }
    }

    // Then try manual mappings
    if (!matchedUrl) {
      for (const mapping of manualMappings) {
        if (titleLower.includes(mapping.titleContains)) {
          for (const file of files) {
            if (file.name.toLowerCase().includes(mapping.fileContains)) {
              matchedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${file.name}`;
              break;
            }
          }
        }
        if (matchedUrl) break;
      }
    }

    // Then try title-based matching
    if (!matchedUrl) {
      const titleWords = titleLower.split(/\s+/).filter(w => w.length > 4);
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const matchedWords = titleWords.filter(w => fileName.includes(w));
        if (matchedWords.length >= 2) {
          matchedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pdfs/documents/${file.name}`;
          break;
        }
      }
    }

    if (matchedUrl) {
      const { error: updateError } = await supabase
        .from('assets')
        .update({ pdf_url: matchedUrl })
        .eq('id', asset.id);

      if (updateError) {
        console.log(`   ❌ Failed to link "${asset.title}": ${updateError.message}`);
      } else {
        console.log(`   ✅ Linked: "${asset.title}"`);
        console.log(`      → ${matchedUrl.split('/').pop()}`);
        linkedCount++;
      }
    }
  }

  console.log(`\n   Newly linked: ${linkedCount} assets`);

  // Step 6: Final verification
  console.log('\n6. Final verification...\n');

  const { data: finalAssets } = await supabase
    .from('assets')
    .select('id, title, pdf_url')
    .or('metadata->>is_case_study.eq.true,client.neq.null');

  const withPdf = finalAssets?.filter(a => a.pdf_url) || [];
  const withoutPdf = finalAssets?.filter(a => !a.pdf_url) || [];

  console.log(`   ✅ Case studies with PDF: ${withPdf.length}`);
  console.log(`   ❌ Case studies without PDF: ${withoutPdf.length}`);

  if (withoutPdf.length > 0) {
    console.log('\n   Still missing PDFs:');
    withoutPdf.forEach(a => console.log(`   - ${a.title} (ID: ${a.id})`));
  }
}

linkCaseStudies().catch(console.error);
