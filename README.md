# Almasons Gini — Backend-Driven E-Learning LMS POC

A production-shaped POC/Pilot LMS based on the uploaded reference UI theme. The frontend is a generic renderer; course structure, modules, lessons, quizzes, progress and completion rules are persisted in PostgreSQL and evaluated server-side.

## Stack
- Next.js 15 + React 19 + TypeScript
- Tailwind-compatible custom CSS theme
- Prisma + PostgreSQL
- JWT in httpOnly cookie
- bcrypt password hashing
- pdf-lib certificate PDF generation
- Docker Compose for PostgreSQL

## Run

```bash
cp .env.example .env
npm install
docker compose up -d
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

### Demo accounts
- Student: `student@example.com` / `Password123!`
- Admin: `admin@example.com` / `Password123!`
- Instructor: `instructor@example.com` / `Password123!`

## Main flows
- `/courses` — backend-driven catalog
- `/courses/generative-ai-for-everyone` — course details
- `/dashboard` — learner dashboard
- `/learn/:courseId` — dynamic learning player
- `/certificates` — certificates
- `/admin` — admin console
- `/admin/courses/new` — create a course
- `/admin/courses/:id/builder` — add modules and lessons
- `/verify-certificate/:number` — public verification

## Backend rules
The backend determines module locks, lesson completion, quiz scoring, course completion and certificate eligibility. Quiz correct answers are never returned by the learner quiz GET endpoint.

## POC limitation
The course builder intentionally starts simple: it demonstrates backend-driven creation of courses, modules and lesson types. A production version should add richer editors, uploads/S3, drag-and-drop ordering, full CRUD, instructor assignment, analytics and HLS video delivery.
