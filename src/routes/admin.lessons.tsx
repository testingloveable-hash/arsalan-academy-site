import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { actions, useStore, type Lesson, type QuizQuestion } from "@/lib/store";

export const Route = createFileRoute("/admin/lessons")({
  component: LessonsAdmin,
});

const uid = () => Math.random().toString(36).slice(2, 9);

function LessonsAdmin() {
  const courses = useStore((s) => s.courses);
  const lessons = useStore((s) => s.lessons);
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id ?? "");
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Lesson, "id">>(emptyLesson(selectedCourse));

  const list = lessons.filter((l) => l.courseId === selectedCourse).sort((a, b) => a.day - b.day);

  const openNew = () => { setEditing(null); setForm(emptyLesson(selectedCourse)); setOpen(true); };
  const openEdit = (l: Lesson) => { setEditing(l); const { id: _id, ...rest } = l; setForm(rest); setOpen(true); };
  const save = () => {
    if (editing) actions.updateLesson(editing.id, form);
    else actions.addLesson(form);
    setOpen(false);
  };

  const addQuestion = () => setForm({ ...form, quiz: [...form.quiz, { id: uid(), question: "", options: ["", "", "", ""], correctIndex: 0 }] });
  const updateQ = (i: number, patch: Partial<QuizQuestion>) => setForm({ ...form, quiz: form.quiz.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) });
  const removeQ = (i: number) => setForm({ ...form, quiz: form.quiz.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lessons</h2>
          <p className="text-sm text-muted-foreground">Add lessons and configure chatbot / quiz practice per lesson.</p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <Label className="text-xs">Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={openNew} disabled={!selectedCourse}><Plus className="mr-1 h-4 w-4" /> Add Lesson</Button>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No lessons yet — add the first one.</Card>
      ) : (
        <div className="space-y-3">
          {list.map((l) => (
            <Card key={l.id} className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--brand-blue)]/10 text-sm font-bold text-[color:var(--brand-blue)]">D{l.day}</div>
              <div className="flex-1">
                <p className="font-medium">{l.title}</p>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  {l.chatbotEnabled && <span>Chatbot: {l.chatbotTopic || "—"}</span>}
                  {l.quizEnabled && <span>Quiz: {l.quiz.length} questions</span>}
                  {!l.chatbotEnabled && !l.quizEnabled && <span>No practice</span>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this lesson?")) actions.deleteLesson(l.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle>{editing ? "Edit lesson" : "Add lesson"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Day number</Label><Input type="number" min={1} value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Video URL / embed</Label><Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." /></div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Switch checked={form.chatbotEnabled} onCheckedChange={(v) => setForm({ ...form, chatbotEnabled: v })} />
                <Label className="!mt-0 font-semibold">Enable Chatbot Practice</Label>
              </div>
              {form.chatbotEnabled && (
                <div className="mt-3 space-y-3">
                  <div><Label>Lesson topic / grammar point</Label><Input value={form.chatbotTopic} onChange={(e) => setForm({ ...form, chatbotTopic: e.target.value })} placeholder="Simple Present Tense" /></div>
                  <div><Label>Example prompts (one per line)</Label>
                    <Textarea rows={4} value={form.chatbotPrompts.join("\n")} onChange={(e) => setForm({ ...form, chatbotPrompts: e.target.value.split("\n").filter(Boolean) })} />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Switch checked={form.quizEnabled} onCheckedChange={(v) => setForm({ ...form, quizEnabled: v })} />
                <Label className="!mt-0 font-semibold">Enable Quiz</Label>
              </div>
              {form.quizEnabled && (
                <div className="mt-3 space-y-3">
                  {form.quiz.map((q, i) => (
                    <div key={q.id} className="rounded-md border bg-muted/30 p-3">
                      <div className="flex items-start gap-2">
                        <Input className="flex-1" placeholder="Question" value={q.question} onChange={(e) => updateQ(i, { question: e.target.value })} />
                        <Button size="sm" variant="ghost" onClick={() => removeQ(i)}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input type="radio" checked={q.correctIndex === oi} onChange={() => updateQ(i, { correctIndex: oi })} className="h-4 w-4" />
                            <Input value={opt} placeholder={`Option ${oi + 1}`} onChange={(e) => updateQ(i, { options: q.options.map((o, x) => (x === oi ? e.target.value : o)) })} />
                          </div>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Select the radio next to the correct option.</p>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={addQuestion}><Plus className="mr-1 h-3 w-3" /> Add question</Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create lesson"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function emptyLesson(courseId: string): Omit<Lesson, "id"> {
  return {
    courseId,
    title: "",
    day: 1,
    videoUrl: "",
    chatbotEnabled: true,
    chatbotTopic: "",
    chatbotPrompts: [],
    quizEnabled: false,
    quiz: [],
  };
}