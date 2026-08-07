import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Trophy, CirclePlay as PlayCircle, MessageCircle, Sparkles, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_public/")({
  component: Home,
});

function Home() {
  const { courses, testimonials, settings } = useStore((s) => s);
  const featured = courses.filter((c) => c.featured).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-white via-white to-[color:var(--brand-blue)]/5">
        <div className="absolute inset-0 bg-dot-grid opacity-60" aria-hidden />
        <div className="absolute -right-24 top-0 hidden h-full w-1/2 bg-gradient-to-l from-[color:var(--brand-blue)]/10 to-transparent md:block" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div>
            <Badge className="mb-5 bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/10">
              <Award className="mr-1 h-3 w-3" /> CELTA-Qualified Trainer
            </Badge>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-[color:var(--brand-navy)] md:text-6xl">
              {settings.heroHeadline}
              <span className="mt-2 block text-[color:var(--brand-blue)]">Speak With Confidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{settings.heroSubheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-[color:var(--brand-navy)] text-[color:var(--brand-navy)]">
                <Link to="/contact">Book a Free Consultation</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <a href={`tel:${settings.phone1}`} className="flex items-center gap-1.5 hover:text-primary"><Phone className="h-3.5 w-3.5" /> {settings.phone1}</a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-primary"><Mail className="h-3.5 w-3.5" /> {settings.email}</a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-full w-full rounded-2xl bg-[color:var(--brand-blue)]" aria-hidden />
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop"
              alt="Student studying English"
              className="relative h-[420px] w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      {featured.length > 0 && <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Programs</p>
            <h2 className="mt-2 text-4xl font-bold text-[color:var(--brand-navy)]">Featured Courses</h2>
          </div>
          <Button asChild variant="ghost" className="hidden md:inline-flex"><Link to="/courses">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((c) => (
            <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="group">
              <Card className="overflow-hidden py-0 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="space-y-2 p-5">
                  <Badge variant="secondary" className="bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)]">{c.category}</Badge>
                  <h3 className="text-lg font-semibold leading-snug text-[color:var(--brand-navy)]">{c.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span>{c.daysLabel}</span>
                    <span className="font-semibold text-foreground">{c.price}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>}

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">How it works</p>
            <h2 className="mt-2 text-4xl font-bold text-[color:var(--brand-navy)]">Learn. Practice. Unlock the next day.</h2>
            <p className="mt-4 text-muted-foreground">Our daily rhythm turns short lessons into real fluency — the way modern language schools actually work.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              { icon: PlayCircle, title: "Watch", text: "A focused 5–10 min video lesson from Sir Arsalan." },
              { icon: MessageCircle, title: "Practice with AI", text: "Chat with our coach or take a quick quiz on that exact topic." },
              { icon: Sparkles, title: "Get Feedback", text: "Instant scoring and pointers so you know what to fix." },
              { icon: Trophy, title: "Unlock Next Day", text: "New lesson unlocks the following day — consistency wins." },
            ].map((step, i) => (
              <div key={step.title} className="relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-border">
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-blue)] text-sm font-bold text-white">{i + 1}</div>
                <step.icon className="h-8 w-8 text-[color:var(--brand-blue)]" />
                <h3 className="mt-4 text-lg font-semibold text-[color:var(--brand-navy)]">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop"
              alt="Arsalan Munir"
              className="rounded-2xl object-cover shadow-xl"
            />
          </div>
          <div className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Founder</p>
            <h2 className="mt-2 text-4xl font-bold text-[color:var(--brand-navy)]">Arsalan Munir</h2>
            <p className="mt-1 text-sm text-muted-foreground">CELTA Qualified · Founder & Lead Trainer</p>
            <p className="mt-6 text-base leading-relaxed text-foreground/80">
              With a Cambridge CELTA qualification, Arsalan helps learners build practical English skills for exams,
              education, work, and everyday communication. His approach is patient, focused, and built around real progress.
            </p>
            <Button asChild className="mt-6 bg-[color:var(--brand-navy)] hover:bg-[color:var(--brand-navy)]/90">
              <Link to="/about">Read the story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Student stories</p>
            <h2 className="mt-2 text-4xl font-bold text-[color:var(--brand-navy)]">Real students. Real results.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <Card key={t.id} className="p-6">
                <div className="flex gap-1 text-[color:var(--brand-blue)]">{"★".repeat(t.rating)}</div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">"{t.quote}"</p>
                <p className="mt-4 text-sm font-semibold text-[color:var(--brand-navy)]">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.course}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>}

      {/* CTA BAND */}
      <section className="mx-auto my-20 max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[color:var(--brand-navy)] px-8 py-14 text-white md:px-14">
          <div className="absolute inset-0 bg-dot-grid opacity-30" aria-hidden />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Ready to unlock your future?</h2>
              <p className="mt-2 text-white/70">Talk to us — we'll help you pick the right course.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                <a href={`tel:${settings.phone1}`}><Phone className="mr-1 h-4 w-4" /> Call {settings.phone1}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-[color:var(--brand-navy)]">
                <Link to="/contact">Message us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}