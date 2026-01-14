import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HomeContent } from "@/components/home-content"

export default async function HomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's groups
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, groups(*)")
    .eq("user_id", data.user.id)

  // Fetch pinned notes from all user's groups
  const groupIds = memberships?.map((m) => m.group_id) || []
  let pinnedNotes: unknown[] = []
  let recentNotes: unknown[] = []

  if (groupIds.length > 0) {
    const { data: pinned } = await supabase
      .from("sticky_notes")
      .select("*, profiles(*), groups(*)")
      .in("group_id", groupIds)
      .eq("is_pinned", true)
      .order("created_at", { ascending: false })
      .limit(5)

    pinnedNotes = pinned || []

    const { data: recent } = await supabase
      .from("sticky_notes")
      .select("*, profiles(*), groups(*)")
      .in("group_id", groupIds)
      .eq("is_pinned", false)
      .order("created_at", { ascending: false })
      .limit(10)

    recentNotes = recent || []
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const groups = memberships?.map((m) => m.groups).filter(Boolean) || []

  return (
    <HomeContent
      user={data.user}
      profile={profile}
      groups={groups}
      pinnedNotes={pinnedNotes}
      recentNotes={recentNotes}
    />
  )
}
