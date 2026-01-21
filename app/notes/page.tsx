import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PersonalNotesContent } from "@/components/personal-notes-content"

export default async function PersonalNotesPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: notes } = await supabase
    .from("personal_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  return <PersonalNotesContent notes={notes || []} />
}
