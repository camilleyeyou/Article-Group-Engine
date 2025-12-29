/**
 * RAG System Diagnostic & Fix
 * 
 * This script:
 * 1. Tests the current search function
 * 2. Identifies why queries return nothing
 * 3. Provides fixes
 * 
 * Run: node scripts/diagnose-rag.js
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

async function diagnoseRAG() {
  console.log('\n🔍 RAG SYSTEM DIAGNOSTIC\n');
  console.log('═'.repeat(70));

  // Step 1: Check database
  console.log('\n1️⃣  DATABASE CHECK\n');
  
  const { data: assets, count: assetCount } = await supabase
    .from('assets')
    .select('id, title, pdf_url', { count: 'exact' });
  
  const { count: embeddingCount } = await supabase
    .from('asset_embeddings')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   Assets: ${assetCount}`);
  console.log(`   Embeddings: ${embeddingCount}`);
  console.log(`   Avg embeddings per asset: ${(embeddingCount / assetCount).toFixed(1)}`);
  
  const assetsWithPdf = assets.filter(a => a.pdf_url).length;
  console.log(`   Assets with PDF: ${assetsWithPdf}/${assetCount}`);

  // Step 2: Check if search function exists
  console.log('\n2️⃣  SEARCH FUNCTION CHECK\n');
  
  const testEmbedding = await generateEmbedding('test query');
  
  // Test v1
  const { data: v1Result, error: v1Error } = await supabase.rpc('search_assets', {
    query_embedding: testEmbedding,
    match_count: 5,
    min_similarity: 0.0, // Very low to catch everything
    filter_types: null,
    filter_client: null,
  });
  
  if (v1Error) {
    console.log(`   ❌ search_assets (v1): ${v1Error.message}`);
  } else {
    console.log(`   ✅ search_assets (v1): Works! Found ${v1Result.length} results`);
  }
  
  // Test v2
  const { data: v2Result, error: v2Error } = await supabase.rpc('search_assets_v2', {
    query_embedding: testEmbedding,
    match_count: 5,
    min_similarity: 0.0,
    filter_types: null,
    filter_client: null,
    filter_capability: null,
  });
  
  if (v2Error) {
    console.log(`   ❌ search_assets_v2: ${v2Error.message}`);
  } else {
    console.log(`   ✅ search_assets_v2: Works! Found ${v2Result.length} results`);
  }

  // Step 3: Test with real queries
  console.log('\n3️⃣  REAL QUERY TESTS\n');
  
  const testQueries = [
    "CrowdStrike case study",
    "product launch strategy",
    "brand messaging",
    "How do you approach marketing?",
    "We need help with a conference keynote",
  ];

  for (const query of testQueries) {
    const embedding = await generateEmbedding(query);
    
    // Get raw results with NO minimum similarity
    const { data: results } = await supabase.rpc('search_assets', {
      query_embedding: embedding,
      match_count: 3,
      min_similarity: 0.0,
      filter_types: null,
      filter_client: null,
    });
    
    const topSimilarity = results?.[0]?.similarity || 0;
    const resultCount = results?.length || 0;
    
    console.log(`   "${query.substring(0, 40)}..."`);
    console.log(`   → ${resultCount} results, top similarity: ${(topSimilarity * 100).toFixed(1)}%`);
    
    if (results?.[0]) {
      console.log(`   → Best match: "${results[0].asset.title.substring(0, 50)}..."`);
    }
    console.log('');
  }

  // Step 4: Analyze similarity distribution
  console.log('\n4️⃣  SIMILARITY DISTRIBUTION\n');
  
  const sampleQuery = "marketing strategy and brand positioning";
  const sampleEmbedding = await generateEmbedding(sampleQuery);
  
  const { data: allResults } = await supabase.rpc('search_assets', {
    query_embedding: sampleEmbedding,
    match_count: 50,
    min_similarity: 0.0,
    filter_types: null,
    filter_client: null,
  });
  
  if (allResults && allResults.length > 0) {
    const similarities = allResults.map(r => r.similarity);
    const avg = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    const max = Math.max(...similarities);
    const min = Math.min(...similarities);
    
    console.log(`   Sample query: "${sampleQuery}"`);
    console.log(`   Results: ${allResults.length}`);
    console.log(`   Similarity range: ${(min * 100).toFixed(1)}% - ${(max * 100).toFixed(1)}%`);
    console.log(`   Average: ${(avg * 100).toFixed(1)}%`);
    
    // Distribution
    const buckets = {
      '0-10%': 0, '10-20%': 0, '20-30%': 0, '30-40%': 0, 
      '40-50%': 0, '50-60%': 0, '60-70%': 0, '70%+': 0
    };
    
    similarities.forEach(s => {
      const pct = s * 100;
      if (pct < 10) buckets['0-10%']++;
      else if (pct < 20) buckets['10-20%']++;
      else if (pct < 30) buckets['20-30%']++;
      else if (pct < 40) buckets['30-40%']++;
      else if (pct < 50) buckets['40-50%']++;
      else if (pct < 60) buckets['50-60%']++;
      else if (pct < 70) buckets['60-70%']++;
      else buckets['70%+']++;
    });
    
    console.log('\n   Distribution:');
    Object.entries(buckets).forEach(([range, count]) => {
      if (count > 0) {
        const bar = '█'.repeat(Math.ceil(count / 2));
        console.log(`   ${range.padEnd(8)} ${bar} ${count}`);
      }
    });
  }

  // Step 5: Recommendations
  console.log('\n' + '═'.repeat(70));
  console.log('📋 RECOMMENDATIONS');
  console.log('═'.repeat(70));
  
  const maxSim = allResults?.[0]?.similarity || 0;
  
  if (maxSim < 0.3) {
    console.log(`
⚠️  LOW SIMILARITY SCORES DETECTED (max: ${(maxSim * 100).toFixed(1)}%)

This is NORMAL for semantic search with text-embedding-3-small.
The model produces lower raw similarity scores than older models.

RECOMMENDED FIXES:

1. Lower the minimum similarity threshold to 0.1 or even 0.05
2. The current threshold might be filtering out valid results

Run this SQL in Supabase to check current function:
`);
  } else {
    console.log(`
✅ Similarity scores look reasonable (max: ${(maxSim * 100).toFixed(1)}%)

If queries still return nothing, the issue is likely:
1. The min_similarity threshold in the app code
2. Asset type filtering excluding results
`);
  }

  console.log(`
QUICK FIX - Run this SQL in Supabase SQL Editor:
────────────────────────────────────────────────────────────────────

-- Recreate search function with LOWER threshold (0.05 instead of 0.1)
CREATE OR REPLACE FUNCTION search_assets(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  min_similarity float DEFAULT 0.05,
  filter_types text[] DEFAULT NULL,
  filter_client text DEFAULT NULL
)
RETURNS TABLE (
  asset jsonb,
  similarity float,
  chunk_text text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(a.*) as asset,
    1 - (ae.embedding <=> query_embedding) as similarity,
    ae.chunk_text
  FROM asset_embeddings ae
  JOIN assets a ON a.id = ae.asset_id
  WHERE 
    (filter_types IS NULL OR a.type = ANY(filter_types))
    AND (filter_client IS NULL OR a.client ILIKE '%' || filter_client || '%')
    AND 1 - (ae.embedding <=> query_embedding) >= min_similarity
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

────────────────────────────────────────────────────────────────────
`);
}

diagnoseRAG().catch(console.error);
