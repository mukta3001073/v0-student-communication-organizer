import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { CalculatorContent } from "@/components/calculator-content"

export default async function CalculatorPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  return <CalculatorContent />
}
