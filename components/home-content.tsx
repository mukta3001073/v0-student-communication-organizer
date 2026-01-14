"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile, Group, StickyNote } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import { StickyNoteCard } from "@/components/sticky-note-card"
import { GroupCard } from "@/components/group-card"
import { QuickActions } from "@/components/quick-actions"
import { EmptyState } from "@/components/empty-state"
import { Pin, Clock, Users } from "lucide-react"

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
