import { Link } from "@tanstack/react-router";
import { Facebook, Youtube, Linkedin, Mail, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";

export function Footer() {
  const settings = useStore((s) => s.settings);
  return (
    <footer className="mt-24 border-t border-border bg-[color:var(--brand-navy)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <Link to="/" className="inline-block rounded-lg bg-white p-3" aria-label="Arsalan Academy home">
            <Logo className="h-12 w-auto" />
          </Link>
          <p className="mt-4 text-sm text-white/70">Speak with confidence. Unlock your future.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/90">Explore</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/testimonials" className="hover:text-white">Testimonials</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/90">Contact</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.phone1}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.phone2}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/90">Follow</h4>
          <div className="flex gap-3">
            <a href={settings.facebook} target="_blank" rel="noreferrer" className="rounded-md bg-white/10 p-2 hover:bg-white/20" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            <a href={settings.youtube} target="_blank" rel="noreferrer" className="rounded-md bg-white/10 p-2 hover:bg-white/20" aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
            <a href={settings.linkedin} target="_blank" rel="noreferrer" className="rounded-md bg-white/10 p-2 hover:bg-white/20" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
          </div>
          <Link to="/admin" className="mt-6 inline-block text-xs text-white/40 hover:text-white/70">Admin dashboard →</Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        {settings.footerText}
      </div>
    </footer>
  );
}