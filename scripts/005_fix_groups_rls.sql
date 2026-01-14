-- Fix RLS policies for groups to allow creators to see their groups
-- Drop existing policies
DROP POLICY IF EXISTS "Group members can view groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

-- Updated SELECT policy: allow viewing if user is creator OR is a member
CREATE POLICY "Users can view own or member groups" ON public.groups FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid())
  );

-- INSERT policy stays the same but reworded for clarity
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Fix group_members INSERT policy to allow users to add themselves
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;

CREATE POLICY "Users can join groups or admins can add" ON public.group_members FOR INSERT 
  WITH CHECK (
    -- User can add themselves to any group (they need the group_id from invite/link)
    auth.uid() = user_id 
    OR 
    -- Admins can add anyone
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid() 
      AND gm.role = 'admin'
    )
  );
