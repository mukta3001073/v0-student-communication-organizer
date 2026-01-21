"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile, Group, StickyNote } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import { StickyNoteCard } from "@/components/sticky-note-card"
import { GroupCard } from "@/components/group-card"
import { QuickActions } from "@/components/quick-actions"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Pin, Clock, Users, StickyNote as StickyNoteIcon, Calendar, Calculator } from "lucide-react"
import Link from "next/link"

interface HomeContentProps {
  user: User
  profile: Profile | null
  groups: Group[]
  pinnedNotes: StickyNote[]
  recentNotes: StickyNote[]
}

export function HomeContent({ user, profile, groups, pinnedNotes, recentNotes }: HomeContentProps) {
  const displayName = profile?.display_name || user.phone || "Student"

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="font-semibold">{displayName}</h1>
          </div>
          <QuickActions groups={groups} />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {/* Quick Tools Section */}
        <section className="mb-8">
          <h2 className="font-semibold mb-4">Quick Tools</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/notes">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                    <StickyNoteIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-center">Personal Notes</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/timetable">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-center">Timetable</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/calculator">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Calculator className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-center">Calculator</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Pinned Notes Section */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Pinned Notes</h2>
          </div>
          {pinnedNotes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pinnedNotes.map((note) => (
                <StickyNoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Pin}
              title="No pinned notes yet"
              description="Pin important notes from your groups to see them here"
            />
          )}
        </section>

        {/* Groups Overview */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Your Groups</h2>
            <span className="ml-auto text-sm text-muted-foreground">{groups.length} groups</span>
          </div>
          {groups.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No groups yet"
              description="Create or join a group to start collaborating"
            />
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          {recentNotes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentNotes.map((note) => (
                <StickyNoteCard key={note.id} note={note} compact />
              ))}
            </div>
          ) : (
            <EmptyState icon={Clock} title="No recent activity" description="Notes from your groups will appear here" />
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  )
}
