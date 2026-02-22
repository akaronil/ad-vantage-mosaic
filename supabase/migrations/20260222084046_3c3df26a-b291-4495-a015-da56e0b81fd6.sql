
-- Table to track generation step statuses
CREATE TABLE public.generation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  step TEXT NOT NULL CHECK (step IN ('visuals', 'audio', 'export')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No auth, so public access for now
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to generation_jobs"
  ON public.generation_jobs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast polling
CREATE INDEX idx_generation_jobs_session_step ON public.generation_jobs (session_id, step);
