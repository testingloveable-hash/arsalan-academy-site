import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { actions, CATEGORIES, useStore, type Category, type Course } from "@/lib/store";

export const Route = createFileRoute("/admin/courses")({
  component: CoursesAdmin,
});

const empty: Omit<Course, "id"> = {
  title: "",
  category: "IELTS/TOEFL",
  code: "IELTS",
  description: "",
  level: "",
  price: "",
  thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
  daysPerWeek: 5,
  daysLabel: "Mon–Fri",
  startDate: "",
  dailyTimeLimit: 15,
  featured: false,
};

function CoursesAdmin() {
  const courses = useStore((s) => s.courses);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Course, "id">>(empty);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Course) => { setEditing(c); const { id: _id, ...rest } = c; setForm(rest); setOpen(true); };
  const save = () => {
    if (editing) actions.updateCourse(editing.id, form);
    else actions.addCourse(form);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Courses</h2>
          <p className="text-sm text-muted-foreground">Manage the catalog shown on the public site.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add Course</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit course" : "Add course"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Level</Label><Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></div>
              <div><Label>Certificate code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="IELTS" /></div>
              <div className="md:col-span-2"><Label>Short description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Price</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Thumbnail URL</Label><Input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} /></div>
              <div><Label>Days per week</Label><Input type="number" min={1} max={7} value={form.daysPerWeek} onChange={(e) => setForm({ ...form, daysPerWeek: Number(e.target.value) })} /></div>
              <div><Label>Days label</Label><Input value={form.daysLabel} onChange={(e) => setForm({ ...form, daysLabel: e.target.value })} placeholder="Mon–Fri" /></div>
              <div><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>Daily practice limit (min)</Label><Input type="number" value={form.dailyTimeLimit} onChange={(e) => setForm({ ...form, dailyTimeLimit: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-3 md:col-span-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> <Label className="!mt-0">Featured on homepage</Label></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save changes" : "Create course"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Practice</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell><span className="rounded-full bg-[color:var(--brand-blue)]/10 px-2 py-0.5 text-xs text-[color:var(--brand-blue)]">{c.category}</span></TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.daysLabel} · {c.daysPerWeek}/wk</TableCell>
                <TableCell className="text-xs">{c.dailyTimeLimit} min/day</TableCell>
                <TableCell>{c.price}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete "${c.title}"? Its lessons will also be removed.`)) actions.deleteCourse(c.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}