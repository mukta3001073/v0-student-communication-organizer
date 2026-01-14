"use client"

import type { Group } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, FlaskConical, Shapes } from "lucide-react"
import Link from "next/link"

interface GroupCardProps {
  group: Group
}

const groupTypeConfig = {
  class: { icon: BookOpen, label: "Class", color: "bg-blue-500/10 text-blue-600" },
  club: { icon: Users, label: "Club", color: "bg-green-500/10 text-green-600" },
  lab: { icon: FlaskConical, label: "Lab", color: "bg-amber-500/10 text-amber-600" },
  other: { icon: Shapes, label: "Other", color: "bg-gray-500/10 text-gray-600" },
}

export function GroupCard({ group }: GroupCardProps) {
  const config = groupTypeConfig[group.type] || groupTypeConfig.other
  const Icon = config.icon

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{group.name}</h3>
              {group.description && (
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{group.description}</p>
              )}
              <Badge variant="outline" className="mt-2 text-xs">
                {config.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
