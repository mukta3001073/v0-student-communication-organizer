-- Fix RLS recursion by using SECURITY DEFINER functions
-- This breaks the circular reference between groups and group_members policies

-- First, drop ALL problematic policies
DROP POLICY IF EXISTS "Group members can view groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view own or member groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can delete groups" ON public.groups;

DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups or admins can add" ON public.group_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.group_members;

-- Create SECURITY DEFINER functions to check membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_member(check_group_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = check_group_id AND user_id = check_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(check_group_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = check_group_id AND user_id = check_user_id AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_creator(check_group_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = check_group_id AND created_by = check_user_id
  );
$$;

-- Now create non-recursive RLS policies for GROUPS
CREATE POLICY "groups_select_policy" ON public.groups FOR SELECT 
  USING (
    created_by = auth.uid() OR 
    public.is_group_member(id, auth.uid())
  );

CREATE POLICY "groups_insert_policy" ON public.groups FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_update_policy" ON public.groups FOR UPDATE 
  USING (public.is_group_admin(id, auth.uid()));

CREATE POLICY "groups_delete_policy" ON public.groups FOR DELETE 
  USING (public.is_group_admin(id, auth.uid()));

-- Create non-recursive RLS policies for GROUP_MEMBERS
-- SELECT: Users can see members of groups they belong to OR groups they created
CREATE POLICY "group_members_select_policy" ON public.group_members FOR SELECT 
  USING (
    public.is_group_member(group_id, auth.uid()) OR 
    public.is_group_creator(group_id, auth.uid())
  );

-- INSERT: Users can add themselves, OR group creator can add, OR admin can add
CREATE POLICY "group_members_insert_policy" ON public.group_members FOR INSERT 
  WITH CHECK (
    -- User adding themselves
    (auth.uid() = user_id) OR
    -- Group creator adding members
    public.is_group_creator(group_id, auth.uid()) OR
    -- Admin adding members
    public.is_group_admin(group_id, auth.uid())
  );

-- DELETE: Users can remove themselves, OR admin can remove
CREATE POLICY "group_members_delete_policy" ON public.group_members FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    public.is_group_admin(group_id, auth.uid())
  );

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_creator(uuid, uuid) TO authenticated;
