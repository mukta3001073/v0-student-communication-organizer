-- Fix RLS recursion for sticky_notes and polls tables
-- These policies reference group_members directly, causing the same recursion issue

-- Drop existing policies for sticky_notes
DROP POLICY IF EXISTS "Group members can view notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Group members can create notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Note creators can update notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Note creators can delete notes" ON public.sticky_notes;

-- Drop existing policies for polls
DROP POLICY IF EXISTS "Group members can view polls" ON public.polls;
DROP POLICY IF EXISTS "Group members can create polls" ON public.polls;
DROP POLICY IF EXISTS "Poll creators can update polls" ON public.polls;
DROP POLICY IF EXISTS "Poll creators can delete polls" ON public.polls;

-- Drop existing policies for files
DROP POLICY IF EXISTS "Group members can view files" ON public.files;
DROP POLICY IF EXISTS "Group members can upload files" ON public.files;
DROP POLICY IF EXISTS "File uploaders can delete files" ON public.files;

-- Drop existing policies for poll_votes
DROP POLICY IF EXISTS "Group members can view non-anonymous votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Group members can vote" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.poll_votes;

-- Create new sticky_notes policies using the SECURITY DEFINER functions
CREATE POLICY "sticky_notes_select_policy" ON public.sticky_notes FOR SELECT 
  USING (public.is_group_member(group_id, auth.uid()) OR public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "sticky_notes_insert_policy" ON public.sticky_notes FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    (public.is_group_member(group_id, auth.uid()) OR public.is_group_creator(group_id, auth.uid()))
  );

CREATE POLICY "sticky_notes_update_policy" ON public.sticky_notes FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "sticky_notes_delete_policy" ON public.sticky_notes FOR DELETE 
  USING (auth.uid() = created_by);

-- Create new polls policies using the SECURITY DEFINER functions
CREATE POLICY "polls_select_policy" ON public.polls FOR SELECT 
  USING (public.is_group_member(group_id, auth.uid()) OR public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "polls_insert_policy" ON public.polls FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    (public.is_group_member(group_id, auth.uid()) OR public.is_group_creator(group_id, auth.uid()))
  );

CREATE POLICY "polls_update_policy" ON public.polls FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "polls_delete_policy" ON public.polls FOR DELETE 
  USING (auth.uid() = created_by);

-- Create new files policies using the SECURITY DEFINER functions
CREATE POLICY "files_select_policy" ON public.files FOR SELECT 
  USING (public.is_group_member(group_id, auth.uid()) OR public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "files_insert_policy" ON public.files FOR INSERT 
  WITH CHECK (
    auth.uid() = uploaded_by AND 
    (public.is_group_member(group_id, auth.uid()) OR public.is_group_creator(group_id, auth.uid()))
  );

CREATE POLICY "files_delete_policy" ON public.files FOR DELETE 
  USING (auth.uid() = uploaded_by);

-- Create helper function for poll membership check
CREATE OR REPLACE FUNCTION public.is_poll_group_member(check_poll_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = check_poll_id 
    AND (public.is_group_member(p.group_id, check_user_id) OR public.is_group_creator(p.group_id, check_user_id))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_poll_group_member(uuid, uuid) TO authenticated;

-- Create new poll_votes policies
CREATE POLICY "poll_votes_select_policy" ON public.poll_votes FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.is_poll_group_member(poll_id, auth.uid())
  );

CREATE POLICY "poll_votes_insert_policy" ON public.poll_votes FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    public.is_poll_group_member(poll_id, auth.uid())
  );

CREATE POLICY "poll_votes_delete_policy" ON public.poll_votes FOR DELETE 
  USING (auth.uid() = user_id);

-- Also handle poll_votes_v2 if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poll_votes_v2') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "poll_votes_v2_select_policy" ON public.poll_votes_v2;
    DROP POLICY IF EXISTS "poll_votes_v2_insert_policy" ON public.poll_votes_v2;
    DROP POLICY IF EXISTS "poll_votes_v2_delete_policy" ON public.poll_votes_v2;
    
    -- Create new policies
    EXECUTE 'CREATE POLICY "poll_votes_v2_select_policy" ON public.poll_votes_v2 FOR SELECT 
      USING (auth.uid() = user_id OR public.is_poll_group_member(poll_id, auth.uid()))';
    
    EXECUTE 'CREATE POLICY "poll_votes_v2_insert_policy" ON public.poll_votes_v2 FOR INSERT 
      WITH CHECK (auth.uid() = user_id AND public.is_poll_group_member(poll_id, auth.uid()))';
    
    EXECUTE 'CREATE POLICY "poll_votes_v2_delete_policy" ON public.poll_votes_v2 FOR DELETE 
      USING (auth.uid() = user_id)';
  END IF;
END $$;
