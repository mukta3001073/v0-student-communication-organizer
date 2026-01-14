import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Pin, FileText, BarChart3, ArrowRight } from "lucide-react"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    redirect("/home")
  }

  const features = [
    {
      icon: Pin,
      title: "Sticky Notes",
      description: "Pin important information so it never gets lost in chat clutter",
    },
    {
      icon: Users,
      title: "Group Management",
      description: "Organize classes, clubs, and labs in one place",
    },
    {
      icon: FileText,
      title: "File Sharing",
      description: "Share PDFs, slides, and documents with your groups",
    },
    {
      icon: BarChart3,
      title: "Quick Polls",
      description: "Make group decisions easily with built-in voting",
    },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">StudySync</span>
          </div>
          <Button asChild size="sm">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Never miss important
            <br />
            <span className="text-primary">group updates</span> again
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            StudySync helps university students organize group communication. Pin important notes, share files, and make
            decisions together — all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/login">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">Everything you need to stay organized</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl border bg-card p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>Built for students, by students</p>
        </div>
      </footer>
    </div>
  )
}
