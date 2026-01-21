"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PersonalNote } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Pin, PinOff, Trash2, Edit, MoreVertical, StickyNote, ArrowLeft } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PersonalNotesContentProps {
  notes: PersonalNote[]
}

const NOTE_COLORS = [
  { name: "Yellow", value: "yellow", bg: "bg-yellow-100", border: "border-yellow-300" },
  { name: "Blue", value: "blue", bg: "bg-blue-100", border: "border-blue-300" },
  { name: "Green", value: "green", bg: "bg-green-100", border: "border-green-300" },
  { name: "Pink", value: "pink", bg: "bg-pink-100", border: "border-pink-300" },
  { name: "Purple", value: "purple", bg: "bg-purple-100", border: "border-purple-300" },
  { name: "Orange", value: "orange", bg: "bg-orange-100", border: "border-orange-300" },
]

export function PersonalNotesContent({ notes: initialNotes }: PersonalNotesContentProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [notes, setNotes] = useState(initialNotes)
  const [isOpen, setIsOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [color, setColor] = useState("yellow")
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setTitle("")
    setContent("")
    setColor("yellow")
    setEditingNote(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingNote) {
      const { error } = await supabase
        .from("personal_notes")
        .update({ title, content, color, updated_at: new Date().toISOString() })
        .eq("id", editingNote.id)

      if (!error) {
        setNotes(notes.map(n => n.id === editingNote.id ? { ...n, title, content, color } : n))
      }
    } else {
      const { data, error } = await supabase
        .from("personal_notes")
        .insert({ user_id: user.id, title, content, color })
        .select()
        .single()

      if (!error && data) {
        setNotes([data, ...notes])
      }
    }

    setLoading(false)
    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (note: PersonalNote) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setColor(note.color)
    setIsOpen(true)
  }

  const handleDelete = async (noteId: string) => {
    const { error } = await supabase.from("personal_notes").delete().eq("id", noteId)
    if (!error) {
      setNotes(notes.filter(n => n.id !== noteId))
    }
  }

  const handleTogglePin = async (note: PersonalNote) => {
    const { error } = await supabase
      .from("personal_notes")
      .update({ is_pinned: !note.is_pinned })
      .eq("id", note.id)

    if (!error) {
      const updatedNotes = notes.map(n => n.id === note.id ? { ...n, is_pinned: !n.is_pinned } : n)
      updatedNotes.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      setNotes(updatedNotes)
    }
  }

  const getColorClasses = (colorName: string) => {
    const colorObj = NOTE_COLORS.find(c => c.value === colorName) || NOTE_COLORS[0]
    return { bg: colorObj.bg, border: colorObj.border }
  }

  const pinnedNotes = notes.filter(n => n.is_pinned)
  const unpinnedNotes = notes.filter(n => !n.is_pinned)

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4">
          <Link href="/home">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">Personal Notes</h1>
            <p className="text-sm text-muted-foreground">{notes.length} notes</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create Personal Note"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-transform",
                          c.bg,
                          color === c.value ? "scale-110 ring-2 ring-primary ring-offset-2" : ""
                        )}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : editingNote ? "Update Note" : "Create Note"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <StickyNote className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium">No personal notes yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first note to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pinnedNotes.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Pin className="h-4 w-4 text-primary" />
                  <h2 className="font-medium text-sm">Pinned</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pinnedNotes.map((note) => {
                    const colors = getColorClasses(note.color)
                    return (
                      <Card key={note.id} className={cn("border-2", colors.bg, colors.border)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                                <h3 className="font-medium truncate text-foreground">{note.title}</h3>
                              </div>
                              <p className="mt-2 text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(note)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTogglePin(note)}>
                                  <PinOff className="mr-2 h-4 w-4" />
                                  Unpin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(note.id)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}

            {unpinnedNotes.length > 0 && (
              <section>
                {pinnedNotes.length > 0 && (
                  <div className="mb-3">
                    <h2 className="font-medium text-sm text-muted-foreground">Other Notes</h2>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {unpinnedNotes.map((note) => {
                    const colors = getColorClasses(note.color)
                    return (
                      <Card key={note.id} className={cn("border-2", colors.bg, colors.border)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate text-foreground">{note.title}</h3>
                              <p className="mt-2 text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(note)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTogglePin(note)}>
                                  <Pin className="mr-2 h-4 w-4" />
                                  Pin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(note.id)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
