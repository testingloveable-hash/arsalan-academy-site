import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { actions, useStore, type Testimonial } from "@/lib/store";

export const Route = createFileRoute("/admin/testimonials")({
  component: TAdmin,
});

function TAdmin() {
  const items = useStore((s) => s.testimonials);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Testimonial, "id">>({ name: "", course: "", quote: "", rating: 5 });

  const openNew = () => { setEditing(null); setForm({ name: "", course: "", quote: "", rating: 5 }); setOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); const { id: _id, ...rest } = t; setForm(rest); setOpen(true); };
  const save = () => { if (editing) actions.updateTestimonial(editing.id, form); else actions.addTestimonial(form); setOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimonials</h2>
          <p className="text-sm text-muted-foreground">Manage student stories shown on the homepage & testimonials page.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex gap-1 text-[color:var(--brand-blue)]">{"★".repeat(t.rating)}</div>
            <p className="mt-2 text-sm">"{t.quote}"</p>
            <p className="mt-3 text-sm font-semibold">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.course}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete?")) actions.deleteTestimonial(t.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit testimonial" : "Add testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Course taken</Label><Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} /></div>
            <div><Label>Quote</Label><Textarea rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></div>
            <div><Label>Rating (1–5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}