"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserIcon, Phone, Users, StickyNote, LogOut, Settings } from "lucide-react"

interface ProfileContentProps {
  user: User
  profile: Profile | null
  groupCount: number
  notesCount: number
}

export function ProfileContent({ user, profile, groupCount, notesCount }: ProfileContentProps) {
  const router = useRouter()
  const displayName = profile?.display_name || "Student"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Profile</h1>
          <Button size="icon" variant="ghost">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center p-6">
            <Avatar className="mb-4 h-20 w-20">
              <AvatarFallback className="text-2xl">{initials || <UserIcon className="h-8 w-8" />}</AvatarFallback>
            </Avatar>
            <h2 className="mb-1 text-xl font-semibold">{displayName}</h2>
            {user.phone && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {user.phone}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Users className="mb-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">{groupCount}</span>
              <span className="text-sm text-muted-foreground">Groups</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <StickyNote className="mb-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">{notesCount}</span>
              <span className="text-sm text-muted-foreground">Notes</span>
            </CardContent>
          </Card>
        </div>

        {/* Sign Out */}
        <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </main>

      <MobileNav />
    </div>
  )
}
