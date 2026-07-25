import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { actions, CATEGORIES, useStore, type Category, type Course, type Lesson } from "@/lib/store";

export const Route = createFileRoute("/admin/courses")({
  component: CoursesAdmin,
});

type PracticeType = "None" | "Quiz" | "Chatbot" | "Both";

interface DraftLesson {
  key: string;
  title: string;
  day: number;
  videoUrl: string;
  practiceType: PracticeType;
  chatbotTopic: string;
}

const emptyCourse: Omit<Course, "id"> = {
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

const newDraftLesson = (day: number): DraftLesson => ({
  key: Math.random().toString(36).slice(2, 9),
  title: "",
  day,
  videoUrl: "",
  practiceType: "None",
  chatbotTopic: "",
});

function draftToLesson(d: DraftLesson, courseId: string): Omit<Lesson, "id"> {
  const chatbot = d.practiceType === "Chatbot" || d.practiceType === "Both";
  const quiz = d.practiceType === "Quiz" || d.practiceType === "Both";
  return {
    courseId,
    title: d.title,
    day: d.day,
    videoUrl: d.videoUrl,
    chatbotEnabled: chatbot,
    chatbotTopic: d.chatbotTopic,
    chatbotPrompts: [],
    quizEnabled: quiz,
    quiz: [],
  };
}

function CoursesAdmin() {
  const courses = useStore((s) => s.courses);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Course, "id">>(emptyCourse);
  const [draftLessons, setDraftLessons] = useState<DraftLesson[]>([]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyCourse);
    setDraftLessons([newDraftLesson(1)]);
    setOpen(true);
  };
  const openEdit = (c: Course) => {
    setEditing(c);
    const { id: _id, ...rest } = c;
    setForm(rest);
    setDraftLessons([]);
    setOpen(true);
  };

  const save = () => {
    if (editing) {
      actions.updateCourse(editing.id, form);
    } else {
      const created = actions.addCourse(form);
      draftLessons
        .filter((d) => d.title.trim())
        .forEach((d) => actions.addLesson(draftToLesson(d, created.id)));
    }
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
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
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

            {!editing && (
              <div className="mt-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Add Lessons</h3>
                    <p className="text-xs text-muted-foreground">Quickly seed the curriculum. You can edit or add more from the Lessons tab later.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setDraftLessons((ls) => [...ls, newDraftLesson((ls[ls.length - 1]?.day ?? 0) + 1)])}>
                    <Plus className="mr-1 h-3 w-3" /> Add another lesson
                  </Button>
                </div>
                <div className="mt-3 space-y-3">
                  {draftLessons.length === 0 && (
                    <p className="text-xs italic text-muted-foreground">No lessons queued. Click "Add another lesson" to start.</p>
                  )}
                  {draftLessons.map((d, i) => (
                    <div key={d.key} className="rounded-md border bg-muted/30 p-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-2 text-xs font-mono text-muted-foreground">#{i + 1}</span>
                        <div className="grid flex-1 gap-2 md:grid-cols-6">
                          <div className="md:col-span-3">
                            <Label className="text-xs">Title</Label>
                            <Input value={d.title} onChange={(e) => setDraftLessons((ls) => ls.map((x) => (x.key === d.key ? { ...x, title: e.target.value } : x)))} placeholder="Lesson title" />
                          </div>
                          <div>
                            <Label className="text-xs">Day</Label>
                            <Input type="number" min={1} value={d.day} onChange={(e) => setDraftLessons((ls) => ls.map((x) => (x.key === d.key ? { ...x, day: Number(e.target.value) } : x)))} />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs">Video URL</Label>
                            <Input value={d.videoUrl} onChange={(e) => setDraftLessons((ls) => ls.map((x) => (x.key === d.key ? { ...x, videoUrl: e.target.value } : x)))} placeholder="YouTube / Vimeo URL" />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs">Practice type</Label>
                            <Select value={d.practiceType} onValueChange={(v) => setDraftLessons((ls) => ls.map((x) => (x.key === d.key ? { ...x, practiceType: v as PracticeType } : x)))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="Quiz">Quiz</SelectItem>
                                <SelectItem value="Chatbot">Chatbot</SelectItem>
                                <SelectItem value="Both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(d.practiceType === "Chatbot" || d.practiceType === "Both") && (
                            <div className="md:col-span-4">
                              <Label className="text-xs">Chatbot topic</Label>
                              <Input value={d.chatbotTopic} onChange={(e) => setDraftLessons((ls) => ls.map((x) => (x.key === d.key ? { ...x, chatbotTopic: e.target.value } : x)))} placeholder="e.g. Simple Present Tense" />
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setDraftLessons((ls) => ls.filter((x) => x.key !== d.key))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  You can also add and edit lessons anytime from the <strong>Lessons</strong> tab in the sidebar.
                </p>
              </div>
            )}

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
