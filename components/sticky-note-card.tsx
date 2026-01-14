"use client"

import type { StickyNote } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pin, Calendar, Clock } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

interface StickyNoteCardProps {
  note: StickyNote
  compact?: boolean
}

export function StickyNoteCard({ note, compact = false }: StickyNoteCardProps) {
  const hasDeadline = note.deadline && new Date(note.deadline) > new Date()
  const groupName = note.group?.name || "Unknown Group"
  const authorName = note.profiles?.display_name || "Anonymous"

  if (compact) {
    return (
      <Link href={`/groups/${note.group_id}`}>
        <Card className="transition-colors hover:bg-accent/50">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm">{note.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {groupName} · {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </p>
              </div>
              {note.is_pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/groups/${note.group_id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <Badge variant="secondary" className="text-xs">
              {groupName}
            </Badge>
            {note.is_pinned && <Pin className="h-4 w-4 text-primary" />}
          </div>
          <p className="mb-3 line-clamp-3 text-sm">{note.content}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
            </div>
            {hasDeadline && (
              <div className="flex items-center gap-1 text-destructive">
                <Calendar className="h-3 w-3" />
                <span>Due {format(new Date(note.deadline!), "MMM d")}</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">by {authorName}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
