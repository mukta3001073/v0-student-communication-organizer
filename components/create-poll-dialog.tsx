"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, X } from "lucide-react"

interface CreatePollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
}

export function CreatePollDialog({ open, onOpenChange, groupId }: CreatePollDialogProps) {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validOptions = options.filter((o) => o.trim())
    if (!question.trim() || validOptions.length < 2) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    console.log("[v0] Creating poll with:", {
      group_id: groupId,
      created_by: user.user.id,
      question: question.trim(),
      options: validOptions,
      is_anonymous: isAnonymous,
    })

    const { data, error: insertError } = await supabase
      .from("polls")
      .insert({
        group_id: groupId,
        created_by: user.user.id,
        question: question.trim(),
        options: validOptions,
        is_anonymous: isAnonymous,
      })
      .select()

    if (insertError) {
      console.log("[v0] Poll creation error:", insertError)
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    console.log("[v0] Poll created successfully:", data)

    setQuestion("")
    setOptions(["", ""])
    setIsAnonymous(false)
    onOpenChange(false)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Poll</DialogTitle>
          <DialogDescription>Ask your group a question and collect votes</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="What should we discuss next?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Options</Label>
            <div className="flex flex-col gap-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous" className="cursor-pointer">
              Anonymous voting
            </Label>
            <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading || !question.trim() || options.filter((o) => o.trim()).length < 2}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Poll"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
