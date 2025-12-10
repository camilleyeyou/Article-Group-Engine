import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase client with service role (for admin operations)
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(url, serviceKey);
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          type: string;
          title: string;
          client: string | null;
          description: string | null;
          content: string | null;
          metadata: Record<string, unknown> | null;
          thumbnail_url: string | null;
          source_url: string | null;
          vimeo_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assets']['Insert']>;
      };
      asset_embeddings: {
        Row: {
          id: string;
          asset_id: string;
          embedding: number[];
          chunk_index: number;
          chunk_text: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['asset_embeddings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['asset_embeddings']['Insert']>;
      };
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          layout_type: string;
          required_content_types: string[];
          tone_guidance: string | null;
          is_fallback: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['templates']['Insert']>;
      };
      queries: {
        Row: {
          id: string;
          session_id: string | null;
          user_input: string;
          classified_intent: string | null;
          confidence_score: number | null;
          template_id: string | null;
          served_asset_ids: string[];
          generated_narrative: string | null;
          latency_ms: number | null;
          feedback: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['queries']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['queries']['Insert']>;
      };
      pinning_rules: {
        Row: {
          id: string;
          keyword: string;
          asset_id: string;
          priority: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pinning_rules']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pinning_rules']['Insert']>;
      };
    };
  };
};
