import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GroupsContent } from "@/components/groups-content"

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's groups with member count
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, groups(*)")
    .eq("user_id", data.user.id)

  const groups = memberships?.map((m) => ({ ...m.groups, userRole: m.role })).filter(Boolean) || []

  return <GroupsContent groups={groups} />
}
