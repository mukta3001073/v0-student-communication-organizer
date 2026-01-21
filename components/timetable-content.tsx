"use client"

import React from "react"

import { useState, useEffect } from "react"
import type { TimetableEvent } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Clock, MapPin, Bell, Edit, Trash2, MoreVertical, Calendar, ArrowLeft } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TimetableContentProps {
  events: TimetableEvent[]
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const EVENT_COLORS = [
  { name: "Blue", value: "blue", bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700" },
  { name: "Green", value: "green", bg: "bg-green-500", light: "bg-green-100", text: "text-green-700" },
  { name: "Purple", value: "purple", bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700" },
  { name: "Orange", value: "orange", bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700" },
  { name: "Pink", value: "pink", bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-700" },
  { name: "Red", value: "red", bg: "bg-red-500", light: "bg-red-100", text: "text-red-700" },
]

const ALERT_OPTIONS = [
  { value: 0, label: "No alert" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
]

export function TimetableContent({ events: initialEvents }: TimetableContentProps) {
  const supabase = createBrowserClient()
  const [events, setEvents] = useState(initialEvents)
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay.toString())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [location, setLocation] = useState("")
  const [color, setColor] = useState("blue")
  const [alertBefore, setAlertBefore] = useState("15")

  // Check for upcoming alerts
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      events.forEach((event) => {
        if (event.day_of_week === currentDay && event.alert_before > 0) {
          const [hours, minutes] = event.start_time.split(":").map(Number)
          const eventTime = hours * 60 + minutes
          const alertTime = eventTime - event.alert_before

          if (currentTime === alertTime) {
            if (Notification.permission === "granted") {
              new Notification(`Upcoming: ${event.title}`, {
                body: `Starting in ${event.alert_before} minutes${event.location ? ` at ${event.location}` : ""}`,
                icon: "/icon.svg",
              })
            }
          }
        }
      })
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    const interval = setInterval(checkAlerts, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [events])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDayOfWeek(selectedDay.toString())
    setStartTime("09:00")
    setEndTime("10:00")
    setLocation("")
    setColor("blue")
    setAlertBefore("15")
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const eventData = {
      title,
      description: description || null,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      location: location || null,
      color,
      alert_before: parseInt(alertBefore),
    }

    if (editingEvent) {
      const { error } = await supabase
        .from("timetable_events")
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq("id", editingEvent.id)

      if (!error) {
        setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e))
      }
    } else {
      const { data, error } = await supabase
        .from("timetable_events")
        .insert({ user_id: user.id, ...eventData })
        .select()
        .single()

      if (!error && data) {
        const newEvents = [...events, data].sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
          return a.start_time.localeCompare(b.start_time)
        })
        setEvents(newEvents)
      }
    }

    setLoading(false)
    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (event: TimetableEvent) => {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description || "")
    setDayOfWeek(event.day_of_week.toString())
    setStartTime(event.start_time.slice(0, 5))
    setEndTime(event.end_time.slice(0, 5))
    setLocation(event.location || "")
    setColor(event.color)
    setAlertBefore(event.alert_before.toString())
    setIsOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    const { error } = await supabase.from("timetable_events").delete().eq("id", eventId)
    if (!error) {
      setEvents(events.filter(e => e.id !== eventId))
    }
  }

  const getColorClasses = (colorName: string) => {
    return EVENT_COLORS.find(c => c.value === colorName) || EVENT_COLORS[0]
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const h = parseInt(hours)
    const ampm = h >= 12 ? "PM" : "AM"
    const hour = h % 12 || 12
    return `${hour}:${minutes} ${ampm}`
  }

  const todayEvents = events.filter(e => e.day_of_week === selectedDay)

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
            <h1 className="font-semibold">Timetable</h1>
            <p className="text-sm text-muted-foreground">{events.length} classes scheduled</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Class" : "Add Class to Timetable"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Class Name</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mathematics 101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes about this class..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Room 301, Building A"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alert</Label>
                  <Select value={alertBefore} onValueChange={setAlertBefore}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={cn(
                          "h-8 w-8 rounded-full transition-transform",
                          c.bg,
                          color === c.value ? "scale-110 ring-2 ring-primary ring-offset-2" : ""
                        )}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : editingEvent ? "Update Class" : "Add Class"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1">
        {/* Day selector */}
        <div className="border-b px-4 py-3">
          <div className="flex gap-1 overflow-x-auto">
            {SHORT_DAYS.map((day, index) => {
              const isToday = index === new Date().getDay()
              const hasEvents = events.some(e => e.day_of_week === index)
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "flex flex-col items-center px-3 py-2 rounded-lg min-w-[48px] transition-colors",
                    selectedDay === index 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted",
                    isToday && selectedDay !== index && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <span className="text-xs font-medium">{day}</span>
                  {hasEvents && selectedDay !== index && (
                    <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-4 py-6">
          <h2 className="font-medium mb-4">{DAYS[selectedDay]}</h2>
          
          {todayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No classes on {DAYS[selectedDay]}</h3>
              <p className="text-sm text-muted-foreground mt-1">Add a class to your timetable</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event) => {
                const colors = getColorClasses(event.color)
                return (
                  <Card key={event.id} className={cn("border-l-4", `border-l-${event.color}-500`)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className={cn("w-1 rounded-full", colors.bg)} />
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(event.start_time)} - {formatTime(event.end_time)}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </span>
                              )}
                              {event.alert_before > 0 && (
                                <span className="flex items-center gap-1">
                                  <Bell className="h-3.5 w-3.5" />
                                  {event.alert_before}m
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(event)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-destructive">
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
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
