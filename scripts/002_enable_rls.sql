-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups policies (members can view, creators can manage)
CREATE POLICY "Group members can view groups" ON public.groups FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid()));
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group admins can update groups" ON public.groups FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Group admins can delete groups" ON public.groups FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'));

-- Group members policies
CREATE POLICY "Members can view group members" ON public.group_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid()));
CREATE POLICY "Admins can add members" ON public.group_members FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_members.group_id AND user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can remove members" ON public.group_members FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin')
  );

-- Sticky notes policies
CREATE POLICY "Group members can view notes" ON public.sticky_notes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = sticky_notes.group_id AND user_id = auth.uid()));
CREATE POLICY "Group members can create notes" ON public.sticky_notes FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = sticky_notes.group_id AND user_id = auth.uid())
  );
CREATE POLICY "Note creators can update notes" ON public.sticky_notes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Note creators can delete notes" ON public.sticky_notes FOR DELETE USING (auth.uid() = created_by);

-- Tags policies (public read, authenticated write)
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Note tags policies
CREATE POLICY "Group members can view note tags" ON public.note_tags FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.sticky_notes sn 
    JOIN public.group_members gm ON sn.group_id = gm.group_id 
    WHERE sn.id = note_id AND gm.user_id = auth.uid()
  ));
CREATE POLICY "Note creators can manage tags" ON public.note_tags FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.sticky_notes WHERE id = note_id AND created_by = auth.uid()));
CREATE POLICY "Note creators can delete tags" ON public.note_tags FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.sticky_notes WHERE id = note_id AND created_by = auth.uid()));

-- Files policies
CREATE POLICY "Group members can view files" ON public.files FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = files.group_id AND user_id = auth.uid()));
CREATE POLICY "Group members can upload files" ON public.files FOR INSERT 
  WITH CHECK (
    auth.uid() = uploaded_by AND 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = files.group_id AND user_id = auth.uid())
  );
CREATE POLICY "File uploaders can delete files" ON public.files FOR DELETE USING (auth.uid() = uploaded_by);

-- Polls policies
CREATE POLICY "Group members can view polls" ON public.polls FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = polls.group_id AND user_id = auth.uid()));
CREATE POLICY "Group members can create polls" ON public.polls FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = polls.group_id AND user_id = auth.uid())
  );
CREATE POLICY "Poll creators can update polls" ON public.polls FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Poll creators can delete polls" ON public.polls FOR DELETE USING (auth.uid() = created_by);

-- Poll options policies
CREATE POLICY "Group members can view poll options" ON public.poll_options FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.polls p 
    JOIN public.group_members gm ON p.group_id = gm.group_id 
    WHERE p.id = poll_id AND gm.user_id = auth.uid()
  ));
CREATE POLICY "Poll creators can add options" ON public.poll_options FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND created_by = auth.uid()));

-- Poll votes policies
CREATE POLICY "Group members can view non-anonymous votes" ON public.poll_votes FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.polls p 
      JOIN public.group_members gm ON p.group_id = gm.group_id 
      WHERE p.id = poll_id AND gm.user_id = auth.uid() AND p.is_anonymous = false
    )
  );
CREATE POLICY "Group members can vote" ON public.poll_votes FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.polls p 
      JOIN public.group_members gm ON p.group_id = gm.group_id 
      WHERE p.id = poll_id AND gm.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own votes" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);
