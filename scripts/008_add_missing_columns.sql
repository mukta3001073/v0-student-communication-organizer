-- Add missing columns to profiles table for email auth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Add options column to polls table (JSON array of option strings)
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- Add tags column to sticky_notes table (JSON array of tag strings)
ALTER TABLE public.sticky_notes ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT NULL;

-- Create poll_votes_v2 table for simpler voting with option_index
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

-- Create RLS policies for poll_votes_v2
CREATE POLICY "poll_votes_v2_select_policy" ON public.poll_votes_v2 FOR SELECT 
  USING (auth.uid() = user_id OR public.is_poll_group_member(poll_id, auth.uid()));

CREATE POLICY "poll_votes_v2_insert_policy" ON public.poll_votes_v2 FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND public.is_poll_group_member(poll_id, auth.uid()));

CREATE POLICY "poll_votes_v2_delete_policy" ON public.poll_votes_v2 FOR DELETE 
  USING (auth.uid() = user_id);

-- Update the trigger to include email in profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
