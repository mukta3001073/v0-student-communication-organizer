-- Update polls table to use JSON array for options (simpler approach)
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS options TEXT[] DEFAULT '{}';

-- Create simplified poll_votes table if it doesn't exist with option_index
CREATE TABLE IF NOT EXISTS public.poll_votes_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS on poll_votes_v2
ALTER TABLE public.poll_votes_v2 ENABLE ROW LEVEL SECURITY;

-- RLS policies for poll_votes_v2
CREATE POLICY "Users can view votes in their groups" ON public.poll_votes_v2
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      JOIN public.group_members gm ON gm.group_id = p.group_id
      WHERE p.id = poll_votes_v2.poll_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own votes" ON public.poll_votes_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id);
