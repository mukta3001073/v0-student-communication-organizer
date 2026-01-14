"use client"

import { useState } from "react"
import type { Group } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plus, StickyNote, Users, FolderPlus } from "lucide-react"
import { CreateNoteDialog } from "@/components/create-note-dialog"
import { CreateGroupDialog } from "@/components/create-group-dialog"

interface QuickActionsProps {
  groups: Group[]
}

export function QuickActions({ groups }: QuickActionsProps) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
            <span className="sr-only">Quick actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setNoteDialogOpen(true)} disabled={groups.length === 0}>
            <StickyNote className="mr-2 h-4 w-4" />
            New Note
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setGroupDialogOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Group
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            Join Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateNoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} groups={groups} />
      <CreateGroupDialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen} />
    </>
  )
}
