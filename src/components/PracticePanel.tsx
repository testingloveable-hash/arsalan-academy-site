import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Bot, CheckCircle2, XCircle, Timer, Send, Lock, Mail } from "lucide-react";
import type { Lesson } from "@/lib/store";

interface Props {
  lesson: Lesson;
  timeLimit: number; // minutes
  adminEmail: string;
  onQuizComplete?: (score: number, total: number) => void;
}

type Msg = { role: "bot" | "user"; text: string };

export function PracticePanel({ lesson, timeLimit, adminEmail }: Props) {
  const modes: ("chatbot" | "quiz")[] = [];
  if (lesson.chatbotEnabled) modes.push("chatbot");
  if (lesson.quizEnabled) modes.push("quiz");
  const [mode, setMode] = useState<"chatbot" | "quiz">(modes[0] ?? "chatbot");
  const [secondsLeft, setSecondsLeft] = useState(timeLimit * 60);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const totalSeconds = timeLimit * 60;
  const pct = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  if (modes.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No practice enabled for this lesson yet.
      </Card>
    );
  }

  if (secondsLeft === 0) {
    return (
      <Card className="border-primary/30 bg-primary/5 p-8 text-center">
        <Lock className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-3 text-lg font-semibold">Your daily practice time is used up</h3>
        <p className="mt-1 text-sm text-muted-foreground">Need more time? Email the academy to request an extension.</p>
        <Button asChild className="mt-4">
          <a href={`mailto:${adminEmail}?subject=Extra practice time request`}>
            <Mail className="mr-2 h-4 w-4" /> Request extra time
          </a>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
        <div className="flex gap-2">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-transparent hover:bg-accent"
              }`}
            >
              {m === "chatbot" ? "AI Chat Practice" : "Quick Quiz"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>{mm}:{ss} left today</span>
        </div>
      </div>
      <div className="px-4 pt-2">
        <Progress value={pct} className="h-1.5" />
      </div>
      <div className="p-4">
        {mode === "chatbot" ? <ChatMode lesson={lesson} /> : <QuizMode lesson={lesson} />}
      </div>
    </Card>
  );
}

function ChatMode({ lesson }: { lesson: Lesson }) {
  const prompts = useMemo(
    () => (lesson.chatbotPrompts.length ? lesson.chatbotPrompts : [`Let's practice ${lesson.chatbotTopic}. Try making a sentence.`]),
    [lesson],
  );
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: `Hi! I'm your practice coach for "${lesson.chatbotTopic || lesson.title}". ${prompts[0]}` },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setTimeout(() => {
      const next = prompts[step % prompts.length];
      const feedback = mockFeedback(userText);
      setMessages((m) => [...m, { role: "bot", text: `${feedback} Next: ${next}` }]);
      setStep((s) => s + 1);
    }, 500);
  };

  return (
    <div>
      <div className="mb-3 flex h-72 flex-col gap-3 overflow-y-auto rounded-md border bg-muted/20 p-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-white text-foreground shadow-sm ring-1 ring-border"
              }`}
            >
              {m.role === "bot" && <Bot className="mb-1 inline h-3.5 w-3.5 text-primary" />} {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your answer..."
        />
        <Button onClick={send}><Send className="h-4 w-4" /></Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Demo bot with sample prompts. A real AI model plugs in here later.</p>
    </div>
  );
}

function mockFeedback(text: string): string {
  const t = text.toLowerCase();
  if (t.length < 4) return "Try a fuller sentence — at least a subject and verb.";
  if (!/[.!?]$/.test(text)) return "Nice start. Remember to end sentences with punctuation.";
  return "Good — clear structure and correct punctuation!";
}

function QuizMode({ lesson }: { lesson: Lesson }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = lesson.quiz[idx];
  if (!q) return <p className="text-sm text-muted-foreground">No quiz questions yet.</p>;

  if (done) {
    return (
      <div className="rounded-md bg-muted/40 p-6 text-center">
        <h3 className="text-lg font-semibold">Quiz complete!</h3>
        <p className="mt-1 text-3xl font-bold text-primary">{score} / {lesson.quiz.length}</p>
        <Button className="mt-4" onClick={() => { setIdx(0); setSelected(null); setScore(0); setDone(false); }}>
          Try again
        </Button>
      </div>
    );
  }

  const submit = () => {
    if (selected === null) return;
    if (selected === q.correctIndex) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= lesson.quiz.length) setDone(true);
      else { setIdx((i) => i + 1); setSelected(null); }
    }, 900);
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground">Question {idx + 1} of {lesson.quiz.length}</p>
      <h4 className="mt-1 text-base font-semibold">{q.question}</h4>
      <div className="mt-4 space-y-2">
        {q.options.map((opt, i) => {
          const showResult = selected !== null;
          const isCorrect = showResult && i === q.correctIndex;
          const isWrongChoice = showResult && i === selected && i !== q.correctIndex;
          return (
            <button
              key={i}
              onClick={() => selected === null && setSelected(i)}
              className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                isCorrect
                  ? "border-green-500 bg-green-50"
                  : isWrongChoice
                    ? "border-destructive bg-destructive/5"
                    : selected === i
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
              }`}
            >
              <span>{opt}</span>
              {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {isWrongChoice && <XCircle className="h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>
      <Button className="mt-4" onClick={submit} disabled={selected === null}>
        {idx + 1 >= lesson.quiz.length ? "Finish" : "Next"}
      </Button>
    </div>
  );
}