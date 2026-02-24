
-- Add columns to store extracted info and script data for session reload
ALTER TABLE public.generation_jobs
ADD COLUMN IF NOT EXISTS extracted_info jsonb,
ADD COLUMN IF NOT EXISTS ad_script jsonb;
