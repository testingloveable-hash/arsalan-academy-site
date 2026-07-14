import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_public/contact")({
  component: Contact,
  head: () => ({ meta: [{ title: "Contact — Arsalan Academy" }] }),
});

function Contact() {
  const settings = useStore((s) => s.settings);
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Get in touch</p>
      <h1 className="mt-2 text-5xl font-bold text-[color:var(--brand-navy)]">Contact us</h1>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <InfoCard icon={<Phone className="h-5 w-5" />} title="Call" lines={[settings.phone1, settings.phone2]} />
          <InfoCard icon={<Mail className="h-5 w-5" />} title="Email" lines={[settings.email]} />
          <InfoCard icon={<MapPin className="h-5 w-5" />} title="Location" lines={["Karachi, Pakistan"]} />
        </div>
        <Card className="p-6 md:col-span-2">
          {sent ? (
            <div className="py-12 text-center">
              <h2 className="text-2xl font-bold text-[color:var(--brand-navy)]">Thanks — we'll be in touch!</h2>
              <p className="mt-2 text-muted-foreground">Your message has been noted. We'll reply within 24 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Your name</Label><Input required className="mt-1" /></div>
                <div><Label>Email</Label><Input type="email" required className="mt-1" /></div>
              </div>
              <div><Label>Subject</Label><Input className="mt-1" placeholder="Course inquiry" /></div>
              <div><Label>Message</Label><Textarea rows={6} required className="mt-1" /></div>
              <Button type="submit" className="bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">Send message</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <Card className="p-5">
      <div className="inline-flex rounded-md bg-[color:var(--brand-blue)]/10 p-2 text-[color:var(--brand-blue)]">{icon}</div>
      <h3 className="mt-3 font-semibold text-[color:var(--brand-navy)]">{title}</h3>
      {lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
    </Card>
  );
}