"use client"

import { useState } from "react"
import type { Group } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import { GroupCard } from "@/components/group-card"
import { EmptyState } from "@/components/empty-state"
import { CreateGroupDialog } from "@/components/create-group-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Plus, Search } from "lucide-react"

interface GroupsContentProps {
  groups: (Group & { userRole?: string })[]
}

export function GroupsContent({ groups }: GroupsContentProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || group.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Groups</h1>
          <Button size="icon" variant="ghost" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-5 w-5" />
            <span className="sr-only">Create group</span>
          </Button>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {/* Filters */}
        <div className="px-4 pb-3">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="class" className="text-xs">
                Classes
              </TabsTrigger>
              <TabsTrigger value="club" className="text-xs">
                Clubs
              </TabsTrigger>
              <TabsTrigger value="lab" className="text-xs">
                Labs
              </TabsTrigger>
              <TabsTrigger value="other" className="text-xs">
                Other
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {filteredGroups.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={search ? "No groups found" : "No groups yet"}
            description={search ? "Try a different search term" : "Create or join a group to get started"}
          />
        )}
      </main>

      <MobileNav />
      <CreateGroupDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
