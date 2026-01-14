import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile-content"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get group count
  const { count: groupCount } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id)

  // Get notes count
  const { count: notesCount } = await supabase
    .from("sticky_notes")
    .select("*", { count: "exact", head: true })
    .eq("created_by", data.user.id)

  return <ProfileContent user={data.user} profile={profile} groupCount={groupCount || 0} notesCount={notesCount || 0} />
}
