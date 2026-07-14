import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, ListVideo, Timer, Users, MessageSquareQuote, Settings, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — Arsalan Academy" }, { name: "robots", content: "noindex" }] }),
});

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/lessons", label: "Lessons", icon: ListVideo },
  { to: "/admin/limits", label: "Practice Limits", icon: Timer },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
] as const;

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col bg-[color:var(--brand-navy)] text-white md:flex">
        <div className="border-b border-white/10 p-4">
          <div className="rounded-md bg-white p-2">
            <Logo className="h-9 w-auto" />
          </div>
          <p className="mt-3 text-xs uppercase tracking-wider text-white/50">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              activeOptions={{ exact: it.exact }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-[color:var(--brand-blue)] [&.active]:text-white"
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" /> View public site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Arsalan Academy</p>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Logo className="h-8 w-auto" />
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b bg-background p-2 md:hidden">
          {items.map((it) => (
            <Link key={it.to} to={it.to} activeOptions={{ exact: it.exact }} className="whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium hover:bg-accent [&.active]:bg-primary [&.active]:text-primary-foreground">
              {it.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}