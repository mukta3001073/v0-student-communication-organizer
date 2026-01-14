import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { GroupDetailContent } from "@/components/group-detail-content"

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch group details first
  const { data: group, error: groupError } = await supabase.from("groups").select("*").eq("id", id).single()

  if (groupError || !group) {
    console.log("[v0] Group not found or error:", groupError)
    notFound()
  }

  // Check if user is a member of this group
  const { data: membership, error: membershipError } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", id)
    .eq("user_id", userData.user.id)
    .single()

  const isCreator = group.created_by === userData.user.id

  if (!membership && !isCreator) {
    console.log("[v0] User is not a member and not creator:", { membershipError, isCreator })
    notFound()
  }

  if (isCreator && !membership) {
    console.log("[v0] Creator not in members table, adding...")
    await supabase.from("group_members").insert({
      group_id: id,
      user_id: userData.user.id,
      role: "admin",
    })
  }

  const userRole = membership?.role || (isCreator ? "admin" : "member")

  // Fetch group notes
  const { data: notes, error: notesError } = await supabase
    .from("sticky_notes")
    .select("*, profiles(*)")
    .eq("group_id", id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (notesError) {
    console.log("[v0] Notes fetch error:", notesError)
  }

  // Fetch group members
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("*, profiles(*)")
    .eq("group_id", id)
    .order("role", { ascending: true })

  if (membersError) {
    console.log("[v0] Members fetch error:", membersError)
  }

  // Fetch polls with votes
  const { data: polls, error: pollsError } = await supabase
    .from("polls")
    .select("*, profiles(*), poll_votes_v2(*)")
    .eq("group_id", id)
    .order("created_at", { ascending: false })

  if (pollsError) {
    console.log("[v0] Polls fetch error:", pollsError)
  }

  // Transform polls to rename poll_votes_v2 to poll_votes
  const transformedPolls = (polls || []).map((poll) => ({
    ...poll,
    poll_votes: poll.poll_votes_v2 || [],
  }))

  return (
    <GroupDetailContent
      group={group}
      notes={notes || []}
      members={members || []}
      polls={transformedPolls}
      userRole={userRole}
      userId={userData.user.id}
    />
  )
}
