# StudyFlow

StudyFlow is a full-stack web application designed to help university students organise their academic workload. Instead of juggling multiple apps for timetables, coursework, flashcards and to-do lists, StudyFlow combines them into a single platform with an intelligent scheduling system that automatically plans study sessions around lectures and existing commitments.

---

## Features

### Timetable Management

* Weekly timetable view
* Recurring lecture scheduling
* Manual study blocks
* Automatic coursework sessions

### Coursework Management

* Create, edit and delete coursework
* Track deadlines
* Record grades
* Estimate study hours
* Monitor completion status

### Intelligent Study Scheduler

* Automatically schedules coursework before deadlines
* Avoids timetable conflicts
* Respects lectures and manually created events
* Distributes work across multiple days
* Prevents excessive daily workload
* Recalculates schedules whenever coursework changes

### Flashcards

* Organise cards into sets
* Quiz mode
* Review mode

### Todo Lists

* Personal task management
* Class-linked tasks
* Priority levels
* Completion tracking
* Overdue detection

### Class Management

* Store module information
* Lecturer details
* Credits
* Target grades
* Colour coding

### Dashboard

* Today's timetable
* Upcoming coursework
* Today's tasks
* Flashcard shortcuts
* Academic progress summary

### Review
* Check progress
* Current average grade
* Overdue task flags

---

# System Architecture

```mermaid
flowchart TB
    Browser["Browser"]

    subgraph App["StudyFlow — React + Vite"]
        Routes["routes/\nAppRoutes, PrivateRoutes"]
        Pages["pages/\nDashboard, Timetable, Coursework,\nFlashcards, Todo, Review, Classes..."]
        Components["components/\nreusable UI (timetable, coursework,\nflashcards, todo, dashboard, review)"]
        AuthCtx["context/\nAuthContext (session state)"]
        Hooks["hooks/\nuseCoursework, useTimetable,\nuseCourseworkSchedule, useTodos,\nuseFlashcards, useClasses, useReview..."]
        Utils["utils/\ncourseworkScheduler, schedulerScoring,\nschedulerCandidates, lectureSchedule,\ntimetable, datetime (pure logic)"]
        Services["services/ + lib/\ncourseworkScheduleService,\ntimetableService, lectureService,\nsupabaseClient"]
    end

    subgraph Supabase["Supabase"]
        Auth["Auth\n(email/password sessions)"]
        DB[("PostgreSQL\nRow Level Security")]
    end

    Browser --> Routes
    Routes --> Pages
    Routes --> AuthCtx
    Pages --> Components
    Pages --> Hooks
    AuthCtx --> Auth
    Hooks --> Utils
    Hooks --> Services
    Services --> Auth
    Services --> DB
```

---

# Database Design

```mermaid
erDiagram
    USERS ||--o{ CLASSES : owns
    USERS ||--o{ ASSIGNMENTS : owns
    USERS ||--o{ LECTURES : owns
    USERS ||--o{ TIME_BLOCKS : owns
    USERS ||--o{ FLASHCARD_SETS : owns
    USERS ||--o{ FLASHCARDS : owns
    USERS ||--o{ TODOS : owns

    CLASSES ||--o{ ASSIGNMENTS : has
    CLASSES ||--o{ LECTURES : has
    CLASSES ||--o{ TIME_BLOCKS : has
    CLASSES ||--o{ FLASHCARD_SETS : has
    CLASSES ||--o{ FLASHCARDS : has
    CLASSES ||--o{ TODOS : has

    ASSIGNMENTS ||--o{ TIME_BLOCKS : "generates study sessions"
    LECTURES ||--o{ TIME_BLOCKS : "scheduled as"
    FLASHCARD_SETS ||--o{ FLASHCARDS : contains

    CLASSES {
        uuid id PK
        uuid user_id FK
        text name
        text code
        text lecturer
        text color
        numeric target_grade
        numeric credits
    }

    ASSIGNMENTS {
        uuid id PK
        uuid user_id FK
        uuid class_id FK
        text title
        text description
        date due_date
        text status
        numeric hours
        numeric grade
    }

    LECTURES {
        uuid id PK
        uuid user_id FK
        uuid class_id FK
        text title
        text lecture_url
        int week_number
        int estimated_minutes
        boolean completed
        timestamp completed_at
        timestamp created_at
    }

    TIME_BLOCKS {
        uuid id PK
        uuid user_id FK
        uuid class_id FK
        uuid coursework_id FK
        uuid lecture_id FK
        text title
        date block_date
        time start_time
        time end_time
        text block_type
        boolean is_recurring
        text recurrence_type
        date recurrence_end_date
        boolean auto_generated
        boolean completed
        timestamp created_at
    }

    FLASHCARD_SETS {
        uuid id PK
        uuid user_id FK
        uuid class_id FK
        text title
    }

    FLASHCARDS {
        uuid id PK
        uuid user_id FK
        uuid set_id FK
        uuid class_id FK
        text front
        text back
    }

    TODOS {
        uuid id PK
        uuid user_id FK
        uuid class_id FK
        text title
        date due_date
        boolean completed
        timestamp completed_at
    }
```

---

# Scheduling Algorithm

StudyFlow's core feature is its automatic coursework scheduler.

The scheduler works by:

1. Collecting incomplete coursework.
2. Ranking assignments by urgency and priority.
3. Finding available timetable slots.
4. Scoring candidate study sessions.
5. Selecting the highest-scoring time slot.
6. Repeating until all available study time has been allocated.

The scheduling engine is completely independent from the user interface, making it easy to maintain.

```mermaid
flowchart TD
    Start(["Rebuild triggered\n(coursework created/edited/deleted)"]) --> Filter

    Filter["Filter to active assignments:\nnot completed, has due_date ≥ today,\nestimated hours > 0"] --> Remaining

    Remaining["For each assignment, compute\nremaining minutes =\nestimated minutes − already manually-scheduled minutes"] --> KeepFixed

    KeepFixed["Keep all fixed blocks\n(lectures, manual study, personal events,\nmanually-added coursework blocks)\nDrop only old auto-generated coursework blocks"] --> Loop

    Loop{"Any assignment left with\nremaining minutes > 0\nand not marked 'blocked'?"}

    Loop -- No --> Done(["Return generated blocks +\nany unscheduled assignments"])

    Loop -- Yes --> Sort["Sort candidates by priority:\nurgency (days until due)\n+ workload (remaining minutes)"]

    Sort --> Pick["Pick the highest-priority assignment"]

    Pick --> Find["Find best candidate time slot:\nscan open slots across the planning window,\nskipping lectures/existing blocks,\nlunch/dinner windows, and slots\nshorter than the minimum session length"]

    Find --> Score["Score each candidate slot:\n+ urgency, + earlier-date bonus,\n+ daytime bonus, + remaining-work bonus,\n− deadline-risk penalty,\n− same-assignment-same-day penalty,\n− daily-load penalty"]

    Score --> Best{"Candidate slot found?"}

    Best -- No --> Block["Mark assignment as blocked\n(no room left for it this pass)"]
    Block --> Loop

    Best -- Yes --> Create["Create a generated study block\n(block_type = 'Coursework', auto_generated = true)\nclamped to min/preferred/max session length"]

    Create --> Reduce["Reduce assignment's\nremaining minutes by session duration"]

    Reduce --> Loop

    Done --> Persist["Persist:\ndelete old auto-generated coursework blocks\n→ insert newly generated blocks"]
```

---

# Application Structure

```text
src/
├── components/
├── config/
├── hooks/
├── lib/
├── pages/
├── routes/
├── services/
└── utils/
```

The application follows a layered architecture:

* **Pages** – High-level views and routing.
* **Components** – Reusable UI elements.
* **Hooks** – Business logic and state management.
* **Services** – Communication with Supabase.
* **Utilities** – Pure helper functions and scheduling logic.

```mermaid
flowchart LR
    subgraph src["src/"]
        direction TB
        pages["pages/\nhigh-level views, one per route"]
        components["components/\nclasses, coursework, dashboard,\nflashcards, layout, review,\ntimetable, todo"]
        routes["routes/\nAppRoutes, PrivateRoutes"]
        context["context/\nAuthContext"]
        hooks["hooks/\nstate + business logic per feature"]
        services["services/\nSupabase reads/writes\n(time_blocks, etc.)"]
        lib["lib/\nsupabaseClient"]
        utils["utils/\npure helpers + scheduling engine\n(datetime, timetable, courseworkScheduler,\nschedulerScoring, schedulerCandidates,\nlectureSchedule, quizUtils, dashboardUtils)"]
        config["config/\nform field definitions per entity"]
    end

    routes --> pages
    context --> routes
    pages --> components
    pages --> hooks
    components --> config
    hooks --> services
    hooks --> utils
    services --> lib
```

---

# Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Router
* React Icons

## Backend

* Supabase
* PostgreSQL
* Row Level Security (RLS)

## Testing

* Vitest
* React Testing Library

---

# Testing

The project includes unit tests covering:

* Utility functions
* Custom hooks
* Service layer
* Timetable logic
* Scheduling helpers

Business logic has been separated from UI components wherever possible to maximise testability.

---

# Running Locally

## Clone the repository

```bash
git clone https://github.com/your-username/studyflow.git
cd studyflow
```

## Install dependencies

```bash
npm install
```

## Configure environment variables

Create a `.env` file.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Start the development server

```bash
npm run dev
```

## Run tests

```bash
npm test
```

## Build for production

```bash
npm run build
```

---

# Future Improvements

* Spaced repetition scheduling
* Calendar synchronisation
* Push notifications
* Mobile responsive improvements
* Analytics dashboard
* AI-assisted study recommendations

---

# Motivation

StudyFlow was built to solve a common problem faced by university students: academic information is often spread across multiple disconnected tools. By combining coursework management, scheduling, revision and planning into one application, StudyFlow reduces manual planning while helping students maintain consistent study habits.

The project demonstrates full-stack development using React and Supabase, modular application architecture, custom React hooks, automated scheduling algorithms, relational database design, and comprehensive testing.
