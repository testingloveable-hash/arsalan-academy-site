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

const defaultCourses: Course[] = [];


const defaultLessons: Lesson[] = [];


const defaultTestimonials: Testimonial[] = [];


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

const STORAGE_KEY = "arsalan-academy-v3";

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
  addCourse: (c: Omit<Course, "id">) => {
    const course = { ...c, id: uid() };
    store.set((s) => ({ ...s, courses: [...s.courses, course] }));
    return course;
  },
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