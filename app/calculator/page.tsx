import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CalculatorContent } from "@/components/calculator-content"

export default async function CalculatorPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  return <CalculatorContent />
}
