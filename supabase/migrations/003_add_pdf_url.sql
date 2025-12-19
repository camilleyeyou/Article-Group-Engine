-- Migration: Add pdf_url column to assets table
-- Run this in Supabase SQL Editor

-- Add the pdf_url column
ALTER TABLE assets ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assets_pdf_url ON assets(pdf_url) WHERE pdf_url IS NOT NULL;

-- Create storage bucket for PDFs (run this if bucket doesn't exist)
-- Note: This is usually done via Supabase dashboard or the ingestion script

-- Update RLS policies to allow public read access to assets with PDFs
-- (Already covered by existing policies)

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assets' AND column_name = 'pdf_url';
