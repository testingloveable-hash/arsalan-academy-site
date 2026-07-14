import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/_public/faq")({
  component: FAQ,
  head: () => ({ meta: [{ title: "FAQ — Arsalan Academy" }] }),
});

const faqs = [
  { q: "How long are the courses?", a: "Most IELTS/TOEFL courses run 6–8 weeks. O & A Level programs align with the academic year. Functional English is offered in flexible 4-week cycles." },
  { q: "How does the chatbot practice work?", a: "After each video lesson, you get a short AI-guided chat or quiz on that exact topic. You choose one or both — and get instant feedback." },
  { q: "Do I need to be online at a specific time?", a: "Live sessions are scheduled per course, but practice is on-demand. New lessons unlock daily." },
  { q: "What is the refund policy?", a: "Full refund within the first 3 days of a course if you're not satisfied. After that, credits toward future courses are available on request." },
  { q: "Do you offer group discounts?", a: "Yes — 15% off for groups of 3+ students enrolling together." },
  { q: "Is Arsalan Munir really CELTA-qualified?", a: "Yes. Arsalan holds a Cambridge CELTA and has been teaching English professionally for over a decade." },
];

function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Questions</p>
      <h1 className="mt-2 text-5xl font-bold text-[color:var(--brand-navy)]">Frequently asked</h1>
      <Accordion type="single" collapsible className="mt-8 w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`i${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}