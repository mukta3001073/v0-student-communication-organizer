"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MobileNav } from "@/components/mobile-nav"
import { StickyNoteCard } from "@/components/sticky-note-card"
import { EmptyState } from "@/components/empty-state"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Search, Loader2, StickyNote, FileText, BarChart3, X } from "lucide-react"
import type { StickyNote as StickyNoteType } from "@/lib/types"

interface SearchContentProps {
  userId: string
}

const PREDEFINED_TAGS = ["exam", "assignment", "deadline", "project", "lecture", "meeting", "important"]

export function SearchContent({ userId }: SearchContentProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<StickyNoteType[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim() && selectedTags.length === 0) return

    setIsSearching(true)
    setHasSearched(true)

    const supabase = createClient()

    // Get user's groups first
    const { data: memberships } = await supabase.from("group_members").select("group_id").eq("user_id", userId)

    const groupIds = memberships?.map((m) => m.group_id) || []

    if (groupIds.length === 0) {
      setResults([])
      setIsSearching(false)
      return
    }

    // Build query
    let notesQuery = supabase
      .from("sticky_notes")
      .select("*, profiles(*), groups(*)")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false })
      .limit(20)

    // Add text search if query exists
    if (query.trim()) {
      notesQuery = notesQuery.ilike("content", `%${query}%`)
    }

    // Add tag filter if tags selected
    if (selectedTags.length > 0) {
      notesQuery = notesQuery.overlaps("tags", selectedTags)
    }

    const { data: notes } = await notesQuery

    setResults(notes || [])
    setIsSearching(false)
  }

  const clearFilters = () => {
    setQuery("")
    setSelectedTags([])
    setResults([])
    setHasSearched(false)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Search</h1>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 px-4 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes, files, polls..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching || (!query.trim() && selectedTags.length === 0)}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        <div className="px-4 pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notes" className="gap-1.5 text-xs">
                <StickyNote className="h-3.5 w-3.5" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                Files
              </TabsTrigger>
              <TabsTrigger value="polls" className="gap-1.5 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                Polls
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="px-4 pb-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2">
              {PREDEFINED_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer shrink-0"
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Active filters indicator */}
        {(selectedTags.length > 0 || query) && (
          <div className="flex items-center gap-2 px-4 pb-3">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={clearFilters}>
              Clear all
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-6">
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            {results.map((note) => (
              <StickyNoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : hasSearched ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try searching with different keywords or tags"
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Search your notes"
            description="Find notes, files, and polls across all your groups"
          />
        )}
      </main>

      <MobileNav />
    </div>
  )
}
