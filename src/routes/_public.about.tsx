import { createFileRoute } from "@tanstack/react-router";
import { Award, Heart, Target } from "lucide-react";

export const Route = createFileRoute("/_public/about")({
  component: About,
  head: () => ({ meta: [{ title: "About — Arsalan Academy" }, { name: "description", content: "The story and teaching philosophy of Arsalan Academy." }] }),
});

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">About</p>
      <h1 className="mt-2 text-5xl font-bold text-[color:var(--brand-navy)]">Our story</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/80">
        Arsalan Academy was founded to give students in Pakistan world-class English coaching that actually works —
        blending Cambridge-standard teaching with modern, daily practice tools. What started as a small tutoring
        setup has grown into a trusted name for IELTS, TOEFL, O & A Level, and Teachers' Training.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <Feature icon={<Target className="h-6 w-6" />} title="Mission" text="Unlock every student's potential through confident, correct, communicative English." />
        <Feature icon={<Award className="h-6 w-6" />} title="Credentials" text="Led by Arsalan Munir — Cambridge CELTA qualified trainer." />
        <Feature icon={<Heart className="h-6 w-6" />} title="Philosophy" text="Practical over theoretical. Progress comes from daily practice, not memorization." />
      </div>

      <div className="mt-16 rounded-2xl bg-muted/40 p-8 md:p-12">
        <h2 className="text-2xl font-bold text-[color:var(--brand-navy)]">Teaching philosophy</h2>
        <p className="mt-4 leading-relaxed text-foreground/80">
          We teach English the way learners actually acquire language: short, focused inputs followed by immediate
          practice. Every video lesson pairs with a chat or quiz activity so students apply what they learned within
          minutes. The result is fluency that sticks — not exam tricks that fade after test day.
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="inline-flex rounded-lg bg-[color:var(--brand-blue)]/10 p-3 text-[color:var(--brand-blue)]">{icon}</div>
      <h3 className="mt-4 font-semibold text-[color:var(--brand-navy)]">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}