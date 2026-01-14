"use client"

import type React from "react"

import { useState } from "react"
import type { GroupMember, Profile } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Crown, User, UserPlus, Loader2 } from "lucide-react"

interface MembersListProps {
  members: (GroupMember & { profiles: Profile })[]
  isAdmin: boolean
  userId: string
  groupId: string
}

export function MembersList({ members, isAdmin, userId, groupId }: MembersListProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("email", email.trim().toLowerCase())
      .single()

    if (profileError || !profile) {
      setError("User not found. Make sure they have signed up with this email.")
      setIsLoading(false)
      return
    }

    // Check if already a member
    const existingMember = members.find((m) => m.user_id === profile.id)
    if (existingMember) {
      setError("This user is already a member of this group.")
      setIsLoading(false)
      return
    }

    // Add member
    const { error: insertError } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: profile.id,
      role: "member",
    })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    setSuccess(`${profile.display_name || email} has been added to the group!`)
    setEmail("")
    setIsLoading(false)
    router.refresh()

    // Close dialog after a short delay
    setTimeout(() => {
      setOpen(false)
      setSuccess(null)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to add to this group.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !email.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Members list */}
      <div className="flex flex-col gap-3">
        {members.map((member) => {
          const isCurrentUser = member.user_id === userId
          const displayName = member.profiles?.display_name || "Unknown"
          const initials = displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)

          return (
            <Card key={member.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar>
                  <AvatarFallback>{initials || <User className="h-4 w-4" />}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{displayName}</span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{member.profiles?.email || "No email"}</p>
                </div>
                {member.role === "admin" && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Crown className="h-4 w-4" />
                    Admin
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
