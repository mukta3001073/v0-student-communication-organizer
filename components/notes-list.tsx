"use client"

import { useState } from "react"
import type { StickyNote, Profile } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pin, Calendar, MoreVertical, Trash2, PinOff } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface NotesListProps {
  notes: (StickyNote & { profiles: Profile })[]
  userId: string
}

export function NotesList({ notes, userId }: NotesListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId)
    const supabase = createClient()
    await supabase.from("sticky_notes").delete().eq("id", noteId)
    router.refresh()
    setDeletingId(null)
  }

  const handleTogglePin = async (note: StickyNote) => {
    const supabase = createClient()
    await supabase.from("sticky_notes").update({ is_pinned: !note.is_pinned }).eq("id", note.id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.map((note) => {
        const isOwner = note.created_by === userId
        const hasDeadline = note.deadline && new Date(note.deadline) > new Date()
        const isPastDeadline = note.deadline && new Date(note.deadline) < new Date()

        return (
          <Card key={note.id} className={deletingId === note.id ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {note.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                  <span className="text-xs text-muted-foreground">{note.profiles?.display_name || "Anonymous"}</span>
                </div>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTogglePin(note)}>
                        {note.is_pinned ? (
                          <>
                            <PinOff className="mr-2 h-4 w-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 h-4 w-4" />
                            Pin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(note.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm">{note.content}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                {note.deadline && (
                  <div
                    className={`flex items-center gap-1 ${isPastDeadline ? "text-muted-foreground line-through" : hasDeadline ? "text-destructive" : ""}`}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>Due {format(new Date(note.deadline), "MMM d, h:mm a")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
