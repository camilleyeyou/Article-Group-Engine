import { NextRequest, NextResponse } from 'next/server';
import { classifyAndGetTemplate } from '@/lib/classifier';
import { searchWithPinning } from '@/lib/search';
import { generateNarrative } from '@/lib/narrative';
import { buildLayout } from '@/lib/templates';
import { createServerClient } from '@/lib/supabase';
import type { QueryRequest, QueryResponse, GeneratedResponse, Asset } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: QueryRequest = await request.json();
    const { query, session_id } = body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json<QueryResponse>(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const trimmedQuery = query.trim();
    
    // Step 1: Classify intent and get template
    const { template, confidence } = await classifyAndGetTemplate(trimmedQuery);
    
    // Step 2: Search for relevant assets (with pinning)
    const { pinned, searched } = await searchWithPinning(trimmedQuery, {
      limit: 8,
      assetTypes: template.required_content_types,
    });
    
    // Combine pinned and searched assets
    const allAssets: Asset[] = [
      ...pinned,
      ...searched.map(r => r.asset),
    ];
    
    // Step 3: Generate narrative (Strategic Bridge)
    const narrative = await generateNarrative(trimmedQuery, template, allAssets);
    
    // Step 4: Build layout
    const layout = buildLayout(template, allAssets, narrative);
    
    const latencyMs = Date.now() - startTime;
    
    // Step 5: Log the query
    const supabase = createServerClient();
    const { data: queryLog, error: logError } = await supabase
      .from('queries')
      .insert({
        session_id: session_id || null,
        user_input: trimmedQuery,
        classified_intent: template.slug,
        confidence_score: confidence,
        template_id: template.id,
        served_asset_ids: allAssets.map(a => a.id),
        generated_narrative: narrative,
        latency_ms: latencyMs,
      })
      .select('id')
      .single();
    
    if (logError) {
      console.error('Failed to log query:', logError);
    }
    
    // Build response
    const response: GeneratedResponse = {
      query_id: queryLog?.id || 'unknown',
      template,
      narrative,
      layout,
      assets: allAssets,
      latency_ms: latencyMs,
    };
    
    return NextResponse.json<QueryResponse>({
      success: true,
      data: response,
    });
    
  } catch (error) {
    console.error('Query processing error:', error);
    
    return NextResponse.json<QueryResponse>(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
