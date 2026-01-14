"use client"

import { useState } from "react"
import type { Group, StickyNote, GroupMember, Profile, Poll } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CreateNoteDialog } from "@/components/create-note-dialog"
import { CreatePollDialog } from "@/components/create-poll-dialog"
import { NotesList } from "@/components/notes-list"
import { MembersList } from "@/components/members-list"
import { PollsList } from "@/components/polls-list"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, Plus, StickyNoteIcon, Users, Settings, BarChart3, X } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface GroupDetailContentProps {
  group: Group
  notes: (StickyNote & { profiles: Profile })[]
  members: (GroupMember & { profiles: Profile })[]
  polls: (Poll & { profiles: Profile })[]
  userRole: string
  userId: string
}

const PREDEFINED_TAGS = ["exam", "assignment", "deadline", "project", "lecture", "meeting", "important"]

export function GroupDetailContent({ group, notes, members, polls, userRole, userId }: GroupDetailContentProps) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [pollDialogOpen, setPollDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const isAdmin = userRole === "admin"

  const filteredNotes = selectedTag ? notes.filter((n) => n.tags?.includes(selectedTag)) : notes

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned)
  const otherNotes = filteredNotes.filter((n) => !n.is_pinned)

  // Get unique tags from notes
  const noteTags = [...new Set(notes.flatMap((n) => n.tags || []))]

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-3 px-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/groups">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to groups</span>
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{group.name}</h1>
            <p className="text-xs text-muted-foreground">{members.length} members</p>
          </div>
          {isAdmin && (
            <Button size="icon" variant="ghost">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Group settings</span>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Tabs defaultValue="notes" className="flex h-full flex-col">
          <div className="border-b px-4">
            <TabsList className="h-12 w-full justify-start gap-4 rounded-none border-0 bg-transparent p-0">
              <TabsTrigger
                value="notes"
                className="h-12 rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                <StickyNoteIcon className="mr-2 h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="polls"
                className="h-12 rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Polls
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="h-12 rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                <Users className="mr-2 h-4 w-4" />
                Members
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notes" className="flex-1 px-4 py-4">
            {noteTags.length > 0 && (
              <div className="mb-4">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2">
                    {selectedTag && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer shrink-0 gap-1"
                        onClick={() => setSelectedTag(null)}
                      >
                        Clear
                        <X className="h-3 w-3" />
                      </Badge>
                    )}
                    {noteTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="cursor-pointer shrink-0"
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}

            {filteredNotes.length > 0 ? (
              <div className="flex flex-col gap-6">
                {pinnedNotes.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">Pinned</h3>
                    <NotesList notes={pinnedNotes} userId={userId} />
                  </div>
                )}
                {otherNotes.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">All Notes</h3>
                    <NotesList notes={otherNotes} userId={userId} />
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={StickyNoteIcon}
                title={selectedTag ? "No notes with this tag" : "No notes yet"}
                description={
                  selectedTag ? "Try selecting a different tag" : "Create a note to share information with your group"
                }
              />
            )}
          </TabsContent>

          <TabsContent value="polls" className="flex-1 px-4 py-6">
            {polls.length > 0 ? (
              <PollsList polls={polls} userId={userId} />
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No polls yet"
                description="Create a poll to make group decisions together"
              />
            )}
          </TabsContent>

          <TabsContent value="members" className="flex-1 px-4 py-6">
            <MembersList members={members} isAdmin={isAdmin} userId={userId} groupId={group.id} />
          </TabsContent>
        </Tabs>
      </main>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="lg" className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mb-2">
          <DropdownMenuItem onClick={() => setNoteDialogOpen(true)}>
            <StickyNoteIcon className="mr-2 h-4 w-4" />
            New Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPollDialogOpen(true)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            New Poll
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MobileNav />
      <CreateNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        groups={[group]}
        defaultGroupId={group.id}
      />
      <CreatePollDialog open={pollDialogOpen} onOpenChange={setPollDialogOpen} groupId={group.id} />
    </div>
  )
}
