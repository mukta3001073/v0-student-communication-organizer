-- Create personal_notes table for private notes
CREATE TABLE IF NOT EXISTS public.personal_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create timetable_events table for class schedules
CREATE TABLE IF NOT EXISTS public.timetable_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  color TEXT DEFAULT 'blue',
  alert_before INTEGER DEFAULT 15, -- minutes before to alert
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personal_notes (users can only access their own notes)
CREATE POLICY "Users can view their own personal notes"
  ON public.personal_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personal notes"
  ON public.personal_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal notes"
  ON public.personal_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal notes"
  ON public.personal_notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for timetable_events (users can only access their own events)
CREATE POLICY "Users can view their own timetable events"
  ON public.timetable_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timetable events"
  ON public.timetable_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetable events"
  ON public.timetable_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetable events"
  ON public.timetable_events FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_notes_user_id ON public.personal_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_notes_pinned ON public.personal_notes(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_timetable_events_user_id ON public.timetable_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_events_day ON public.timetable_events(user_id, day_of_week);
