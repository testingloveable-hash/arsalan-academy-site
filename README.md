# Arsalan Academy Site

PROJECT OVERVIEW

Build a modern academic website for Arsalan Academy, an English-language coaching institute run by Arsalan Munir (CELTA-qualified Founder & Lead Trainer). The academy teaches:


IELTS / TOEFL
Functional / General English Language
O & A Level Coaching (IX, X, XI, XII)
Teachers' Training


Tagline: "Unlock Your Future" | Slogan on business card: "Speak With Confidence"

This is phase 1: build the public marketing site + admin dashboard only. Do NOT build a student login/auth system yet — that comes in phase 2. For now, any "student view" (course player, chatbot, quiz) should be built as functional demo/preview pages reachable without login, so the admin (and I) can review the experience before we wire up real auth.


BRAND & DESIGN SYSTEM


Colors: Predominantly white background with two blues — a deep navy/dark blue (#0A1E3D or similar) and a brighter royal/electric blue (#1E5AFF or similar), plus black for contrast text. Do not introduce other accent colors (no green, orange, purple, etc.) — keep it strictly white + two-tone blue + black/gray, matching the logo.
Logo: An "A" mark formed by two blue strokes crossed by a black swoosh, next to wordmark "ARSALAN ACADEMY" (bold, black, with alternating letters in blue for emphasis) and subtext "UNLOCK YOUR FUTURE" (FUTURE in blue). Use the logo in the navbar (left) and footer.
Typography: Clean, bold sans-serif for headings (geometric, confident — similar to the wordmark weight), simple readable sans-serif for body text.
Overall feel: Professional, trustworthy, education-focused, not flashy — small geometric accents (dot grids, X patterns, thin diagonal ribbons) like in the banner are welcome as subtle background decoration, used sparingly.
Imagery: Use clean stock-style photography of students studying/writing (blurred soft-focus background photos are fine), not cartoonish illustrations.



SITE MAP / TABS (Public Site)

Research into other academy websites (test-prep platforms, coaching institutes, and online course academies) shows a consistent set of pages that build trust and make courses easy to browse. Include all of the following:


Home

Hero section: headline ("Unlock Your Future" / "Speak With Confidence"), short subheadline about IELTS/TOEFL/English/O&A Level coaching, primary CTA ("Explore Courses") and secondary CTA ("Book a Free Consultation" or "Contact Us").
Trust strip: CELTA-qualified trainer badge, years of experience, number of students, pass-rate style stat (placeholders admin can edit).
Featured courses (cards pulled from the Courses admin data — 3-4 highlighted).
"How it works" section explaining the actual learning flow: Watch a short video lesson → Practice with the AI chatbot or quiz on that exact topic → Unlock next day's lesson. This is your differentiator vs. plain video courses — make it visually clear with a 3-4 step diagram.
Founder spotlight (Arsalan Munir, CELTA Qualified, Founder & Lead Trainer) with short bio and photo placeholder.
Testimonials section (placeholder cards, admin-editable later).
Contact / call-to-action band with phone numbers (0334-2995825, 0213-497-2122) and email (arsalanmunir25@gmail.com).
Footer: logo, quick links, social icons (Facebook, YouTube, LinkedIn — use the handles from the business card), contact info, copyright.



Courses (catalog page)

Grid/list of all courses as cards: title, short description, level tag (e.g., Beginner/Intermediate/Advanced or Grade level), duration/number of lessons, "days per week" schedule badge, price (optional placeholder), and a "View Course" button.
Filter/sort by category: IELTS/TOEFL, Functional English, O Level, A Level, Teachers' Training.



Course Detail page

Course title, description, instructor (Arsalan Munir), what students will learn (bullet list), schedule info ("1 lesson/day, 5–6 days/week" style, pulled from admin settings for that course).
Curriculum/lesson list (accordion): each lesson shows a lock/unlock icon (locked = future day, unlocked = available), short video thumbnail placeholder, and a note like "Includes AI practice chat after this video."
A demo lesson preview (no login required) showing: video placeholder → "Practice Now" button → opens the chatbot/quiz demo experience described below.
"Enroll" button (can just open a contact/email modal for now since there's no login yet).



Lesson / Practice Demo Experience (this is the core feature — build as a working interactive demo)

Video player placeholder for the lesson.
After the video, show a Practice Panel with two modes an admin can toggle per lesson:

Chatbot mode: a simple chat UI where the bot asks contextual follow-up questions related to the lesson topic (e.g., for "Simple Present Tense" it asks the student to describe their daily routine, gives an affirmative sentence and asks for the negative form, or gives a sentence and asks the student to find the grammar mistake). Build this chat UI functionally with a few hardcoded example Q&A flows per topic so it feels real, plus a clear spot to later plug in a real AI/LLM call.
Quiz mode: a short multiple-choice or fill-in-the-blank quiz UI tied to the lesson topic, with instant feedback (correct/incorrect) and a small score summary at the end.



A practice timer / daily limit indicator ("You have 12 of 15 minutes left today for this course") reflecting the per-course/per-student time limit the admin sets. Show a friendly locked state when time runs out: "Your daily practice time is used up. Need more time? Email the academy to request an extension." with a mailto link to the admin email.



About Us

Story of Arsalan Academy, mission ("Unlock Your Future"), founder's credentials (CELTA Qualified, Founder & Lead Trainer).
Teaching philosophy — practical, confidence-building English training.



Testimonials / Success Stories

Placeholder grid of student reviews/results (editable via admin later).



Blog / Resources (optional but common on academy sites — include a simple placeholder page)

List of articles/tips (e.g., "5 Tips to Boost Your IELTS Speaking Score") — can be static placeholder cards for now.



Contact Us

Contact form (name, email, message — just UI, no backend needed yet), phone numbers, email, map/address placeholder, social links.



FAQ (common on IELTS/coaching sites) — accordion of common questions (course duration, how the chatbot practice works, refund policy placeholder, etc.)



ADMIN DASHBOARD (No login yet — just build the interface, accessible via an /admin route)

Build a clean, functional admin panel UI (with local/mock data for now — Loveable can wire to Supabase later) with the following sections:

1. Dashboard Overview


Quick stats: total courses, total lessons, active students (placeholder numbers), pending "extra time request" emails (placeholder count).


2. Course Management


Table/list of all courses with Add / Edit / Delete actions.
"Add Course" form fields:

Course title, category (IELTS/TOEFL, Functional English, O Level, A Level, Teacher Training), short description, level, price (optional), thumbnail image upload placeholder.
Schedule settings: number of lessons per week (e.g., 5–6 days/week), which days, start date.
Daily practice time limit (in minutes) for the chatbot/quiz practice tied to this course.





3. Lesson Management (within a course)


Add/Edit/Delete lessons under a selected course.
Each lesson has: title, order/day number, video upload/embed field (placeholder for now), and a toggle: "Enable Chatbot" and/or "Enable Quiz" after this lesson (can enable one or both).
If Chatbot enabled: a simple field/textarea where admin types the lesson topic/grammar point (e.g., "Simple Present Tense") and optionally example prompt questions the bot should ask, so it feels connected to what he taught.
If Quiz enabled: a simple quiz builder — add questions, multiple choice options, mark correct answer (basic CRUD form, a few fields, add/remove question rows).


4. Practice Time & Limits Manager


A settings panel showing all courses with their current daily time limit, editable per course (and structured so it could later be made per-student too).
A section titled "Extra Time Requests" — since there's no student login yet, show this as a placeholder inbox/table where requests (currently just emailed to the admin manually) could later be logged automatically. Include a note: "For now, students request extra practice time via email to arsalanmunir25@gmail.com — this table will auto-populate once the student login system is added."


5. Students (placeholder for phase 2)


A simple placeholder page: "Student accounts will appear here once the login system is enabled." with a greyed-out mock table (name, enrolled course, progress %, daily time used) just to preview the future layout — no real data/auth needed now.


6. Testimonials Manager


Add/Edit/Delete testimonial cards (name, course taken, quote, rating stars, photo placeholder) that feed the public Testimonials section.


7. Site Settings


Editable fields for: phone numbers, email, social links, hero headline/subheadline text, footer text — so Arsalan can tweak site copy without touching code.



TECHNICAL NOTES FOR LOVEABLE


Use React + Tailwind CSS, fully responsive (mobile-first — Pakistani students will browse mostly on phones).
No authentication/login system in this build — all admin routes are open at /admin for now (we'll add Supabase auth in a later phase).
Use mock/local state or a simple in-memory data store for courses, lessons, testimonials, and time-limit settings so the admin panel is fully interactive even without a real backend yet.
Keep the chatbot and quiz logic modular/isolated (e.g., a PracticePanel component that takes topic, mode, and timeLimit as props) so it's easy to later connect to a real AI API for dynamic question generation.
Reuse the uploaded logo asset in navbar and footer; keep all buttons/accents in the two blue tones from the logo; avoid adding unrelated colors.
Include smooth micro-interactions (hover states on course cards, accordion animations for curriculum/FAQ, progress bar animation) but keep it professional, not gimmicky.



WHAT NOT TO DO


Do not copy layout, wording, or visual style from any specific existing academy website — build an original design that simply follows common, proven patterns (hero → courses → how it works → testimonials → contact).
Do not build real authentication, payments, or a real AI backend yet — those are explicitly phase 2. Everything student-facing should work as a fully clickable demo/preview without requiring sign-in.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f507f66-3bd1-4bc6-b82d-8812c5d5d232).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
