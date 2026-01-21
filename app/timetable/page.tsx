import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimetableContent } from "@/components/timetable-content"

export default async function TimetablePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: events } = await supabase
    .from("timetable_events")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  return <TimetableContent events={events || []} />
}
