"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Poll, Profile, PollVote } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, EyeOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PollsListProps {
  polls: (Poll & { profiles: Profile; poll_votes?: PollVote[] })[]
  userId: string
}

export function PollsList({ polls, userId }: PollsListProps) {
  return (
    <div className="flex flex-col gap-4">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} userId={userId} />
      ))}
    </div>
  )
}

function PollCard({ poll, userId }: { poll: Poll & { profiles: Profile; poll_votes?: PollVote[] }; userId: string }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [localVotes, setLocalVotes] = useState<PollVote[]>(poll.poll_votes || [])
  const router = useRouter()

  const userVote = localVotes.find((v) => v.user_id === userId)
  const hasVoted = !!userVote
  const totalVotes = localVotes.length

  const getVoteCount = (optionIndex: number) => {
    return localVotes.filter((v) => v.option_index === optionIndex).length
  }

  const getVotePercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0
    return Math.round((getVoteCount(optionIndex) / totalVotes) * 100)
  }

  const handleVote = async () => {
    if (selectedOption === null || hasVoted) return

    setIsVoting(true)
    const supabase = createClient()

    const { error } = await supabase.from("poll_votes_v2").insert({
      poll_id: poll.id,
      user_id: userId,
      option_index: selectedOption,
    })

    if (!error) {
      setLocalVotes([
        ...localVotes,
        {
          id: crypto.randomUUID(),
          poll_id: poll.id,
          user_id: userId,
          option_index: selectedOption,
          created_at: new Date().toISOString(),
        },
      ])
    }

    setIsVoting(false)
    router.refresh()
  }

  const initials =
    poll.profiles?.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-medium">{poll.question}</CardTitle>
          {poll.is_anonymous && (
            <Badge variant="secondary" className="shrink-0 gap-1">
              <EyeOff className="h-3 w-3" />
              Anonymous
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span>{poll.profiles?.display_name || "Unknown"}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {poll.options.map((option, index) => {
          const isSelected = selectedOption === index
          const isUserVote = userVote?.option_index === index
          const percentage = getVotePercentage(index)
          const voteCount = getVoteCount(index)

          return (
            <button
              key={index}
              type="button"
              disabled={hasVoted}
              onClick={() => setSelectedOption(index)}
              className={`relative overflow-hidden rounded-lg border p-3 text-left transition-colors ${
                hasVoted ? "cursor-default" : isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              {hasVoted && (
                <Progress value={percentage} className="absolute inset-0 h-full rounded-none [&>div]:bg-primary/10" />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <span className="font-medium">{option}</span>
                <div className="flex items-center gap-2">
                  {hasVoted && (
                    <span className="text-sm text-muted-foreground">
                      {voteCount} ({percentage}%)
                    </span>
                  )}
                  {isUserVote && <Check className="h-4 w-4 text-primary" />}
                  {!hasVoted && isSelected && (
                    <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary" />
                  )}
                  {!hasVoted && !isSelected && <div className="h-4 w-4 rounded-full border-2" />}
                </div>
              </div>
            </button>
          )
        })}

        {!hasVoted && (
          <Button onClick={handleVote} disabled={selectedOption === null || isVoting} className="mt-2">
            {isVoting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Voting...
              </>
            ) : (
              "Submit Vote"
            )}
          </Button>
        )}

        {hasVoted && (
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""} total
          </p>
        )}
      </CardContent>
    </Card>
  )
}
