"use client"

import type React from "react"

import { useState } from "react"
import type { Group } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, X } from "lucide-react"

interface CreateNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: Group[]
  defaultGroupId?: string
}

const PREDEFINED_TAGS = ["exam", "assignment", "deadline", "project", "lecture", "meeting", "important"]

export function CreateNoteDialog({ open, onOpenChange, groups, defaultGroupId }: CreateNoteDialogProps) {
  const [content, setContent] = useState("")
  const [groupId, setGroupId] = useState(defaultGroupId || "")
  const [isPinned, setIsPinned] = useState(false)
  const [deadline, setDeadline] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !groupId) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    console.log("[v0] Creating note with:", {
      content: content.trim(),
      group_id: groupId,
      created_by: user.id,
      is_pinned: isPinned,
      tags: selectedTags.length > 0 ? selectedTags : null,
      deadline: deadline || null,
    })

    const { data, error: insertError } = await supabase
      .from("sticky_notes")
      .insert({
        content: content.trim(),
        group_id: groupId,
        created_by: user.id,
        is_pinned: isPinned,
        tags: selectedTags.length > 0 ? selectedTags : null,
        deadline: deadline || null,
      })
      .select()

    if (insertError) {
      console.log("[v0] Note creation error:", insertError)
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    console.log("[v0] Note created successfully:", data)

    setContent("")
    setGroupId(defaultGroupId || "")
    setIsPinned(false)
    setDeadline("")
    setSelectedTags([])
    onOpenChange(false)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
          <DialogDescription>Add a new note to share with your group</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="group">Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Tags (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                  {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input id="deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pinned" className="cursor-pointer">
              Pin this note
            </Label>
            <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim() || !groupId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Note"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
