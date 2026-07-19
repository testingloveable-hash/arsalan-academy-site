import { useSyncExternalStore } from "react";

export type Category = "IELTS/TOEFL" | "Functional English" | "O Level" | "A Level" | "Teachers' Training";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  day: number;
  videoUrl: string;
  chatbotEnabled: boolean;
  chatbotTopic: string;
  chatbotPrompts: string[];
  quizEnabled: boolean;
  quiz: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  category: Category;
  code: string;
  description: string;
  level: string;
  price: string;
  thumbnail: string;
  daysPerWeek: number;
  daysLabel: string;
  startDate: string;
  dailyTimeLimit: number; // minutes
  featured: boolean;
}

export interface Certificate {
  id: string;
  number: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  completionDate: string;
  issuedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  course: string;
  quote: string;
  rating: number;
}

export interface SiteSettings {
  heroHeadline: string;
  heroSubheadline: string;
  phone1: string;
  phone2: string;
  email: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  footerText: string;
}

interface State {
  courses: Course[];
  lessons: Lesson[];
  testimonials: Testimonial[];
  settings: SiteSettings;
  certificates: Certificate[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultCourses: Course[] = [
  {
    id: "c1",
    title: "IELTS Academic — Band 7+ Intensive",
    category: "IELTS/TOEFL",
    code: "IELTS",
    description: "Master all four IELTS modules with daily practice, targeted feedback, and mock tests.",
    level: "Intermediate → Advanced",
    price: "PKR 18,000",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
    daysPerWeek: 6,
    daysLabel: "Mon–Sat",
    startDate: "2026-08-01",
    dailyTimeLimit: 15,
    featured: true,
  },
  {
    id: "c2",
    title: "TOEFL iBT Complete Prep",
    category: "IELTS/TOEFL",
    code: "TOEFL",
    description: "Structured 8-week TOEFL program covering Reading, Listening, Speaking, and Writing.",
    level: "Intermediate",
    price: "PKR 20,000",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop",
    daysPerWeek: 5,
    daysLabel: "Mon–Fri",
    startDate: "2026-08-05",
    dailyTimeLimit: 15,
    featured: true,
  },
  {
    id: "c3",
    title: "Functional English — Speak With Confidence",
    category: "Functional English",
    code: "FENG",
    description: "Everyday spoken English for work, travel, and social settings. Build fluency fast.",
    level: "Beginner → Intermediate",
    price: "PKR 12,000",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop",
    daysPerWeek: 5,
    daysLabel: "Mon–Fri",
    startDate: "2026-08-01",
    dailyTimeLimit: 20,
    featured: true,
  },
  {
    id: "c4",
    title: "O Level English (IX–X)",
    category: "O Level",
    code: "OLV",
    description: "Cambridge O Level English Language coaching with past-paper drills and writing feedback.",
    level: "Grade IX–X",
    price: "PKR 15,000",
    thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop",
    daysPerWeek: 5,
    daysLabel: "Mon–Fri",
    startDate: "2026-08-01",
    dailyTimeLimit: 15,
    featured: true,
  },
  {
    id: "c5",
    title: "A Level English (XI–XII)",
    category: "A Level",
    code: "ALV",
    description: "AS/A Level English Language & Literature with essay technique and analytical writing.",
    level: "Grade XI–XII",
    price: "PKR 18,000",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop",
    daysPerWeek: 5,
    daysLabel: "Mon–Fri",
    startDate: "2026-08-01",
    dailyTimeLimit: 15,
    featured: false,
  },
  {
    id: "c6",
    title: "Teachers' Training — CELTA-Style Methods",
    category: "Teachers' Training",
    code: "TCHR",
    description: "Modern communicative teaching methods, lesson planning, and classroom management.",
    level: "For educators",
    price: "PKR 25,000",
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop",
    daysPerWeek: 3,
    daysLabel: "Mon/Wed/Fri",
    startDate: "2026-09-01",
    dailyTimeLimit: 25,
    featured: false,
  },
];

const defaultLessons: Lesson[] = [
  {
    id: "l1",
    courseId: "c3",
    title: "Simple Present Tense — Daily Routines",
    day: 1,
    videoUrl: "",
    chatbotEnabled: true,
    chatbotTopic: "Simple Present Tense",
    chatbotPrompts: [
      "Tell me about your daily morning routine using the simple present.",
      "Turn this into a negative: 'She drinks tea every morning.'",
      "Spot the mistake: 'He go to school at 8am.'",
    ],
    quizEnabled: true,
    quiz: [
      { id: "q1", question: "Choose the correct form: She ___ to college every day.", options: ["go", "goes", "going", "gone"], correctIndex: 1 },
      { id: "q2", question: "Which sentence is correct?", options: ["He don't like tea.", "He doesn't likes tea.", "He doesn't like tea.", "He not like tea."], correctIndex: 2 },
      { id: "q3", question: "Make it negative: 'They play cricket.'", options: ["They not play cricket.", "They don't play cricket.", "They doesn't play cricket.", "They aren't play cricket."], correctIndex: 1 },
    ],
  },
  {
    id: "l2",
    courseId: "c3",
    title: "Present Continuous — What's Happening Now",
    day: 2,
    videoUrl: "",
    chatbotEnabled: true,
    chatbotTopic: "Present Continuous",
    chatbotPrompts: [
      "Describe what you are doing right now in three sentences.",
      "What are the people around you doing? Use present continuous.",
    ],
    quizEnabled: false,
    quiz: [],
  },
  {
    id: "l3",
    courseId: "c1",
    title: "IELTS Speaking Part 1 — Introductions",
    day: 1,
    videoUrl: "",
    chatbotEnabled: true,
    chatbotTopic: "IELTS Speaking Part 1",
    chatbotPrompts: [
      "Where are you from and what do you like about it?",
      "Do you work or study? Tell me more about it.",
      "What do you do in your free time?",
    ],
    quizEnabled: false,
    quiz: [],
  },
  {
    id: "l4",
    courseId: "c1",
    title: "IELTS Writing Task 1 — Describing Graphs",
    day: 2,
    videoUrl: "",
    chatbotEnabled: false,
    chatbotTopic: "",
    chatbotPrompts: [],
    quizEnabled: true,
    quiz: [
      { id: "q1", question: "Best opener for a bar chart summary?", options: ["The graph shows...", "In my opinion...", "First of all...", "To conclude..."], correctIndex: 0 },
      { id: "q2", question: "Which word best shows a sharp increase?", options: ["slightly rose", "surged", "dipped", "stabilised"], correctIndex: 1 },
    ],
  },
];

const defaultTestimonials: Testimonial[] = [
  { id: "t1", name: "Ayesha K.", course: "IELTS Academic", quote: "Scored 7.5 overall on my first attempt. The daily practice chatbot kept me consistent.", rating: 5 },
  { id: "t2", name: "Hamza R.", course: "O Level English", quote: "My essay writing improved from a C to an A* in three months. Sir Arsalan is patient and precise.", rating: 5 },
  { id: "t3", name: "Fatima S.", course: "Functional English", quote: "I finally speak English without hesitation at work. The quizzes made grammar stick.", rating: 5 },
];

const defaultSettings: SiteSettings = {
  heroHeadline: "Unlock Your Future",
  heroSubheadline: "CELTA-qualified coaching for IELTS, TOEFL, O & A Level English, and Teachers' Training — with daily video lessons and AI-guided practice.",
  phone1: "0334-299-5825",
  phone2: "0213-497-2122",
  email: "arsalanmunir25@gmail.com",
  facebook: "https://facebook.com/arsalanacademy",
  youtube: "https://youtube.com/@arsalanacademy",
  linkedin: "https://linkedin.com/in/arsalanmunir",
  footerText: "© Arsalan Academy — Speak With Confidence.",
};

const STORAGE_KEY = "arsalan-academy-v1";

const defaults: State = { courses: defaultCourses, lessons: defaultLessons, testimonials: defaultTestimonials, settings: defaultSettings, certificates: [] };

function load(): State {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      return { ...defaults, ...parsed, certificates: parsed.certificates ?? [] };
    }
  } catch {}
  return defaults;
}

let state: State = defaults;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    state = load();
    hydrated = true;
  }
}

export const store = {
  get: () => state,
  subscribe: (l: () => void) => {
    ensureHydrated();
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  set: (updater: (s: State) => State) => {
    ensureHydrated();
    state = updater(state);
    persist();
    emit();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(defaults),
  );
}

export const actions = {
  addCertificate: (c: Omit<Certificate, "id">) => {
    const cert = { ...c, id: uid() };
    store.set((s) => ({ ...s, certificates: [cert, ...s.certificates] }));
    return cert;
  },
  deleteCertificate: (id: string) => store.set((s) => ({ ...s, certificates: s.certificates.filter((c) => c.id !== id) })),
  addCourse: (c: Omit<Course, "id">) => store.set((s) => ({ ...s, courses: [...s.courses, { ...c, id: uid() }] })),
  updateCourse: (id: string, patch: Partial<Course>) => store.set((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  deleteCourse: (id: string) => store.set((s) => ({ ...s, courses: s.courses.filter((c) => c.id !== id), lessons: s.lessons.filter((l) => l.courseId !== id) })),
  addLesson: (l: Omit<Lesson, "id">) => store.set((s) => ({ ...s, lessons: [...s.lessons, { ...l, id: uid() }] })),
  updateLesson: (id: string, patch: Partial<Lesson>) => store.set((s) => ({ ...s, lessons: s.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
  deleteLesson: (id: string) => store.set((s) => ({ ...s, lessons: s.lessons.filter((l) => l.id !== id) })),
  addTestimonial: (t: Omit<Testimonial, "id">) => store.set((s) => ({ ...s, testimonials: [...s.testimonials, { ...t, id: uid() }] })),
  updateTestimonial: (id: string, patch: Partial<Testimonial>) => store.set((s) => ({ ...s, testimonials: s.testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  deleteTestimonial: (id: string) => store.set((s) => ({ ...s, testimonials: s.testimonials.filter((t) => t.id !== id) })),
  updateSettings: (patch: Partial<SiteSettings>) => store.set((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
};

export const CATEGORIES: Category[] = ["IELTS/TOEFL", "Functional English", "O Level", "A Level", "Teachers' Training"];