
-- Create storage bucket for generated audio assets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-assets', 'audio-assets', true);

-- Allow public read access
CREATE POLICY "Audio assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-assets');

-- Allow anonymous inserts (edge function uses service role, but just in case)
CREATE POLICY "Allow audio asset uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-assets');
