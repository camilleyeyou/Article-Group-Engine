/**
 * Test Search Functionality
 * 
 * Run: node scripts/test-search.js "your query here"
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function testSearch(query) {
  console.log('\n🔍 Testing Search\n');
  console.log('═'.repeat(60));
  console.log(`Query: "${query}"\n`);

  // Step 1: Check database has data
  console.log('1. Checking database...');
  
  const { count: assetCount } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true });
  
  const { count: embeddingCount } = await supabase
    .from('asset_embeddings')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   Assets: ${assetCount}`);
  console.log(`   Embeddings: ${embeddingCount}\n`);

  if (embeddingCount === 0) {
    console.log('❌ No embeddings found! Run the ingest script first.');
    return;
  }

  // Step 2: Generate query embedding
  console.log('2. Generating query embedding...');
  const queryEmbedding = await generateEmbedding(query);
  console.log(`   ✓ Generated ${queryEmbedding.length}-dimension embedding\n`);

  // Step 3: Test RPC function
  console.log('3. Testing search_assets RPC function...');
  
  const { data: searchResults, error: searchError } = await supabase.rpc('search_assets', {
    query_embedding: queryEmbedding,
    match_count: 10,
    min_similarity: 0.1,
    filter_types: null,
    filter_client: null,
  });

  if (searchError) {
    console.log(`   ❌ RPC Error: ${searchError.message}`);
    console.log('\n   You need to run the SQL migration:');
    console.log('   supabase/migrations/004_fix_search_function.sql\n');
    
    // Try direct query as fallback
    console.log('4. Trying direct database query...');
    const { data: directResults, error: directError } = await supabase
      .from('assets')
      .select('*')
      .limit(5);
    
    if (directError) {
      console.log(`   ❌ Direct query error: ${directError.message}`);
    } else {
      console.log(`   ✓ Found ${directResults.length} assets directly`);
      directResults.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.title}`);
      });
    }
    return;
  }

  console.log(`   ✓ Found ${searchResults.length} results\n`);

  // Deduplicate by asset ID (same logic as the app)
  const seen = new Set();
  const dedupedResults = searchResults.filter(result => {
    const assetId = result.asset.id;
    if (seen.has(assetId)) return false;
    seen.add(assetId);
    return true;
  });

  // Step 4: Display results
  console.log(`4. Search Results (${dedupedResults.length} unique):\n`);
  
  if (dedupedResults.length === 0) {
    console.log('   No results found. Try a different query or lower similarity threshold.');
  } else {
    dedupedResults.forEach((result, i) => {
      const asset = result.asset;
      const similarity = (result.similarity * 100).toFixed(1);
      console.log(`   ${i + 1}. [${similarity}%] ${asset.title}`);
      if (asset.pdf_url) {
        console.log(`      📄 Has PDF`);
      }
    });
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✓ Database: ${assetCount} assets, ${embeddingCount} embeddings`);
  console.log(`✓ Search: ${dedupedResults.length} unique results for this query`);
  console.log(`✓ Top similarity: ${dedupedResults.length > 0 ? (dedupedResults[0].similarity * 100).toFixed(1) + '%' : 'N/A'}`);
}

// CLI
const query = process.argv.slice(2).join(' ') || 'marketing strategy case study';
testSearch(query).catch(console.error);
