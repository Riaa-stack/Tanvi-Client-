# EDUARCHIVE AI 2.0

# COMPLETE FRONTEND IMPLEMENTATION + DESIGN MASTER PROMPT

You are now responsible for building the **complete production-quality frontend** for **EduArchive AI 2.0**.

This is NOT a UI prototype.

This is NOT a design-only task.

This is NOT a mock frontend.

You must build the actual frontend that connects to the already implemented EduArchive AI 2.0 backend.

---

# 0. MANDATORY FIRST STEP — UNDERSTAND THE EXISTING PROJECT

Before changing anything, inspect the entire repository.

You MUST:

1. Inspect the existing frontend.
2. Inspect the complete backend.
3. Read the backend implementation specification/architecture document available in the repository.
4. Read the backend audit report available in the repository.
5. Inspect every backend API route.
6. Inspect request schemas.
7. Inspect response schemas.
8. Inspect authentication behavior.
9. Inspect JWT behavior.
10. Inspect paper processing states.
11. Inspect note processing states.
12. Inspect paper analysis responses.
13. Inspect historical intelligence responses.
14. Inspect RAG responses.
15. Inspect chat responses.
16. Inspect notes AI responses.
17. Inspect error formats.
18. Inspect CORS configuration.
19. Inspect pagination/filtering behavior.
20. Inspect all existing frontend code before replacing anything.

The backend is already implemented and audited.

The frontend must consume the **actual backend contract**.

Do not redesign the backend merely to make frontend development easier.

If an actual integration mismatch is discovered, document it and fix it only when necessary.

---

# 1. ABSOLUTE RULES

These rules are NON-NEGOTIABLE.

DO NOT create:

* mock APIs
* mock data
* dummy papers
* dummy notes
* fake AI responses
* fake analytics
* fake questions
* fake historical data
* fake RAG citations
* fake processing percentages
* fake progress timers
* placeholder cards
* TODO implementations
* incomplete routes
* dead buttons
* non-functional tabs
* hardcoded API responses
* simulated backend behavior

Do not use:

`setTimeout()` to simulate processing.

Do not increment progress artificially.

Do not make the UI say READY before the backend says READY.

Do not display historical intelligence unless the backend provides the required historical evidence.

Do not invent information that the backend does not return.

If the backend returns no data:

show a beautiful, meaningful empty state.

---

# 2. PRODUCT IDENTITY

EduArchive AI 2.0 is an:

> **AI-powered academic intelligence platform presented through a premium digital notebook experience.**

The product combines:

### Modern professional SaaS

with:

### Physical academic notebook aesthetics.

The frontend should feel like:

> **A sophisticated AI academic workspace that feels like studying from an intelligent handwritten notebook.**

It should NOT feel like:

* a generic admin dashboard
* a generic AI chatbot
* a generic EdTech template
* a childish school application
* a scrapbook website
* a generic Tailwind dashboard

---

# 3. VISUAL REFERENCES

I will provide visual references alongside this prompt.

There are TWO important visual references.

## REFERENCE A — NOTEBOOK IMAGE

The first reference is the uploaded notebook-style educational image.

Use it as inspiration for:

* handwritten typography
* paper
* highlighter marks
* sticky notes
* hand-drawn arrows
* underlines
* doodles
* notebook lines
* academic annotations
* paper clips
* visual hierarchy
* handwritten educational presentation

DO NOT copy the image literally.

Extract its design language.

---

## REFERENCE B — EDUARCHIVE UI CONCEPT

The second reference is the generated EduArchive AI interface concept showing:

* sidebar
* PDF viewer
* AI Intelligence Notebook
* sticky notes
* highlighter sections
* paper cards
* notes workspace
* flashcards
* handwritten typography
* academic annotations
* split-screen study environment

Treat this as the **primary UI composition reference**.

The actual application must be functional and connected to the backend.

The reference is visual inspiration, NOT static artwork.

---

# 4. THE MOST IMPORTANT DESIGN PRINCIPLE

The frontend has TWO visual modes.

## PRODUCT MODE

Used for:

* login
* registration
* dashboards
* teacher tools
* upload forms
* settings
* account management
* general navigation

Style:

**modern premium SaaS**

---

## STUDY MODE

Used for:

* Paper Vault
* PDF study workspace
* AI Intelligence
* Notes
* Note AI
* Flashcards
* Quiz
* Study Intelligence
* AI-assisted learning

Style:

**premium digital notebook**

This distinction is extremely important.

Do NOT make the entire application look like a scrapbook.

The notebook personality should become strongest when the user is actually studying.

---

# 5. VISUAL STYLE

Use:

* warm off-white paper
* subtle cream
* graphite/ink
* muted academic blue
* muted lavender
* sage
* dusty yellow
* muted coral
* soft pink

Avoid:

* neon colors
* excessive gradients
* excessive glassmorphism
* huge shadows
* excessive rounded cards
* childish rainbow colors
* excessive animations

The design should feel:

**premium**

**calm**

**academic**

**intelligent**

**creative**

**professional**

---

# 6. TYPOGRAPHY

Use TWO typography systems.

## UI FONT

Use a modern readable font such as:

* Inter
* Geist
* Manrope
* DM Sans

Use for:

* navigation
* buttons
* forms
* metadata
* system messages
* filters
* authentication
* dashboard UI

---

## NOTEBOOK FONT

Use handwriting fonts selectively.

Preferred:

### Kalam

or:

### Patrick Hand

or:

### Caveat

Do NOT use handwriting typography for every element.

Use it for:

* notebook headings
* AI explanations
* handwritten labels
* sticky notes
* topic annotations
* study recommendations
* important insights
* flashcards
* notebook-style content

The handwritten text must remain readable.

---

# 7. PAPER SYSTEM

Build a reusable notebook visual system.

Create components such as:

`NotebookSurface`

`NotebookPaper`

`NotebookHeading`

`HandwrittenLabel`

`Highlighter`

`Underline`

`StickyNote`

`PaperClip`

`Tape`

`Doodle`

`MarginLine`

These must be reusable.

Do not duplicate notebook CSS in every page.

---

# 8. NOTEBOOK PAPER

Study surfaces should use:

* warm paper background
* subtle horizontal ruled lines
* subtle vertical notebook margin
* very light paper texture
* realistic but restrained shadows

The background should resemble a physical notebook page.

Do NOT use a heavy image texture.

Prefer CSS where practical.

---

# 9. HANDWRITTEN EFFECTS

Use subtle:

* hand-drawn underlines
* highlighter strokes
* arrows
* circles around important concepts
* stars
* small doodles
* margin annotations

Example:

`Important Topic`

with a slightly imperfect underline.

Do not make these effects excessive.

They should feel intentional.

---

# 10. HIGHILGHTER SYSTEM

Create reusable highlighter styles.

Examples:

### Yellow

Important

### Blue

Information

### Green

Completed/understood

### Coral

Attention

### Lavender

AI insight

Highlighter marks should look slightly organic rather than perfectly rectangular.

Use CSS/SVG where appropriate.

---

# 11. STICKY NOTES

Create reusable sticky-note components.

Examples:

### Quick Note

"Trees are very important."

### Exam Tip

"Focus on graphs and linked lists."

### AI Insight

"Appeared in 3 of 4 historical papers."

Sticky notes may have:

* slight rotation
* tape
* paper shadow
* handwritten typography

Keep rotations subtle.

---

# 12. APPLICATION SHELL

Create a premium application shell.

Desktop:

```text
----------------------------------------------------------
| Sidebar | Main Content                                  |
----------------------------------------------------------
```

Sidebar:

EduArchive AI logo

Navigation changes according to role.

Student:

* Dashboard
* Paper Vault
* Study Intelligence
* My Notes
* AI Assistant
* Flashcards
* Quizzes
* Profile
* Settings

Teacher:

* Dashboard
* Paper Vault
* Upload Paper
* Processing
* Profile
* Settings

Exactly TWO roles:

`TEACHER`

`STUDENT`

No Admin role.

---

# 13. AUTHENTICATION

Build:

`/login`

`/register`

Use real backend authentication.

Implement:

* login
* registration
* access token handling
* refresh token
* logout
* session restoration
* unauthorized handling
* expired token handling
* role-aware routing

Never simulate login.

---

# 14. ROLE PROTECTION

Student cannot access teacher routes.

Teacher cannot access student-only routes.

Protect routes at the frontend AND rely on backend authorization.

Do not trust local storage alone for security.

---

# 15. STUDENT DASHBOARD

Design the student dashboard as:

> "Opening your personal academic notebook."

Include only real backend-supported information.

Possible sections:

### Continue Studying

Recently opened paper/note if available.

### Paper Vault

Available processed papers.

### Study Intelligence

Subjects with intelligence.

### My Notes

Recent notes.

### AI Assistant

Quick access.

### Recent Activity

Only if backend supports it.

Do NOT invent statistics.

---

# 16. TEACHER DASHBOARD

Professional SaaS appearance.

Show real:

* uploaded papers
* processing papers
* ready papers
* failed papers
* recent uploads

Actions:

* upload paper
* view paper
* retry processing
* delete owned paper

---

# 17. PAPER VAULT

This is a core student feature.

All READY papers uploaded by teachers should appear here.

Filters:

* Year
* Semester
* Subject
* Branch

Only READY papers are usable.

Cards should feel like archived academic papers.

Example:

```text
┌───────────────────────────────┐
│ DATA STRUCTURES               │
│                               │
│ Winter 2025                   │
│ Semester 5                   │
│ Computer Engineering          │
│                               │
│ Historical intelligence ✓     │
│                               │
│             Open Paper →      │
└───────────────────────────────┘
```

Use subtle notebook/paper details.

---

# 18. TEACHER PAPER UPLOAD

Create a premium drag-and-drop PDF upload.

Required metadata:

* Year
* Semester
* Subject
* Branch

Show:

* file name
* file size
* PDF preview where appropriate
* remove
* upload

Validate before submission.

Use real backend endpoint.

---

# 19. PAPER PROCESSING

THIS IS A SIGNATURE EXPERIENCE.

After upload, show a full processing experience.

The user must remain in a dynamic processing screen until the backend reports completion/failure.

Backend status is authoritative.

Expected states:

```text
UPLOADED
VALIDATING
EXTRACTING
OCR_PROCESSING
STRUCTURING
EMBEDDING
ANALYZING
READY
FAILED
```

Never fake these.

---

# 20. CANONICAL PENCIL LOADER

Use the supplied **Uiverse animated pencil SVG/CSS by gustavofusco** as the canonical EduArchive document-processing animation.

The provided animation includes:

* pencil body
* rotating pencil
* eraser movement
* pencil tip
* circular stroke

Convert the supplied SVG into React-compatible JSX.

Do not use:

`dangerouslySetInnerHTML`.

Create:

`DocumentProcessingAnimation.tsx`

and centralized styles if necessary.

---

# 21. PENCIL ANIMATION RESPONSIVE SIZES

Do NOT hardcode the original 200px size everywhere.

Create:

```ts
size:
  xs
  sm
  md
  lg
  xl
```

Recommended:

### XS

36–48px

For:

* button
* tiny AI loader

### SM

64–80px

For:

* cards
* inline loading

### MD

100–130px

For:

* panel processing

### LG

160–200px

For:

* main processing screen

### XL

220–260px

Only for spacious desktop processing layouts.

Never overflow the viewport.

---

# 22. PENCIL COLORS

Adapt the supplied blue colors to the EduArchive design system.

Do not use neon blue.

Use CSS variables:

```css
--pencil-primary
--pencil-secondary
--pencil-dark
--pencil-eraser
--pencil-wood
--pencil-graphite
```

The pencil should feel like part of EduArchive.

---

# 23. PROCESSING SCREEN COMPOSITION

Use:

```text
                 EduArchive AI

                  [PENCIL]

             Reading your paper...

       Turning your document into
       academic intelligence.

       ✓ Validate document
       ✓ Extract content
       ● Understand questions
       ○ Build semantic index
       ○ Analyze exam patterns
       ○ Update historical intelligence
```

Surround it with:

* ruled paper
* subtle doodles
* handwritten labels
* tiny sticky note
* paper texture

Do NOT place the pencil inside a giant generic SaaS card.

---

# 24. REAL STAGE MESSAGES

Map backend states to user-friendly copy.

UPLOADED:

"Your paper is safely uploaded."

VALIDATING:

"Checking your document..."

EXTRACTING:

"Reading the question paper..."

OCR_PROCESSING:

"Reading scanned pages..."

STRUCTURING:

"Organizing questions and marks..."

EMBEDDING:

"Building semantic connections..."

ANALYZING:

"Understanding exam patterns..."

READY:

"Your academic intelligence is ready."

FAILED:

"We couldn't finish processing this document."

---

# 25. PROCESSING TIMELINE

Create:

`ProcessingTimeline`

Use:

✓ completed

● active

○ pending

The active stage may have:

* subtle highlighter
* underline
* pulse
* handwritten marker

But never fake completion.

---

# 26. PROCESSING FAILURE

When backend returns FAILED:

STOP the pencil animation.

Show:

* actual safe error message
* Retry Processing
* Back to Vault

Never leave an infinite loader.

---

# 27. PROCESSING SUCCESS

When backend returns READY:

Use a short transition:

Pencil

↓

completion check

↓

"Your paper is ready."

↓

"Open Paper"

Do not pretend the document is ready before backend confirmation.

---

# 28. PENCIL LOADER USAGE THROUGHOUT APP

Use the canonical pencil animation wherever appropriate.

Paper:

* upload processing
* document loading
* paper AI analysis

Notes:

* upload processing
* note loading
* note analysis
* summarization
* diagram generation
* flashcards
* quiz generation

AI:

* RAG response
* Ask AI
* Study Intelligence
* chat response

Use the correct size for each context.

Do NOT replace every tiny application spinner with the large pencil.

---

# 29. REDUCED MOTION

Respect:

`prefers-reduced-motion`

When enabled:

* disable rotation
* disable eraser animation
* disable stroke animation
* show static pencil

Always retain textual status.

---

# 30. MAIN PAPER STUDY WORKSPACE

THIS IS THE MOST IMPORTANT PAGE IN THE APPLICATION.

When a student opens a READY paper, create:

```text
---------------------------------------------------------------
| PDF VIEWER                 | AI INTELLIGENCE NOTEBOOK       |
|                            |                                |
| actual PDF                 | Overview                       |
|                            | Important Topics               |
|                            | Repeated Questions             |
|                            | What To Study                  |
|                            | Mark Distribution              |
|                            | Difficulty                     |
|                            | Exam Trends                    |
|                            | Potential Questions            |
|                            | Ask AI                         |
---------------------------------------------------------------
```

This should closely follow the provided EduArchive UI concept reference.

---

# 31. LEFT SIDE — PDF VIEWER

Use:

React PDF / PDF.js.

Actual backend PDF.

Support:

* page navigation
* zoom
* fit width
* page number
* search if practical
* fullscreen
* download only if permitted
* responsive resizing

Do NOT recreate the PDF using HTML.

---

# 32. RIGHT SIDE — AI INTELLIGENCE NOTEBOOK

This must feel like a physical notebook.

Use:

* ruled paper
* red/pink margin
* handwritten headings
* highlighters
* sticky notes
* paper tape
* small doodles
* underlines
* academic annotations

The AI result should look like:

> AI transformed the paper into handwritten revision notes.

---

# 33. INTELLIGENCE TABS

Implement ALL supported features:

### Overview

### Important Topics

### Repeated Questions

### What To Study

### Mark Distribution

### Difficulty

### Exam Trends

### Potential Questions

### Ask AI

Each tab must have:

* loading
* success
* empty
* error

Do not reload the whole workspace unnecessarily.

---

# 34. IMPORTANT TOPICS

Show:

* topic
* importance
* supporting questions
* page number
* paper/year references

Example:

```text
Trees

HIGH IMPORTANCE

Asked in 4/4 papers

18 marks

View Questions →
```

If page references are provided:

clicking:

`View Questions`

should navigate the PDF viewer to the appropriate page.

---

# 35. REPEATED QUESTIONS

Show actual historical evidence.

Example:

```text
Explain AVL tree rotations.

2022 → 2023 → 2025

Frequency: 3
```

Show:

* frequency
* years
* related papers
* question references

Never invent repetition.

---

# 36. HISTORICAL INTELLIGENCE RULE

Frontend MUST respect:

### 0 papers

Curriculum-aware guidance only.

No historical claims.

### 1 paper

Paper-level analysis only.

Display:

"Historical comparison requires at least two papers."

### 2+ papers

Historical intelligence unlocked.

Show:

* repetition
* topic frequency
* unit importance
* mark trends
* difficulty trends
* question type trends
* study recommendations
* potential patterns

Do not use year as the grouping key.

---

# 37. POTENTIAL QUESTIONS

Never call them guaranteed questions.

Use:

"Potentially Important Patterns"

Language:

"Based on historical patterns..."

"Frequently observed..."

"Potentially important..."

Never:

"This question will appear."

---

# 38. MARK DISTRIBUTION

Use Recharts or equivalent.

Charts should be:

* professional
* minimal
* notebook-inspired
* readable

Do not make charts cartoonish.

---

# 39. DIFFICULTY

Display:

Easy

Medium

Hard

Use real backend analysis.

Show distributions/trends only when supported.

---

# 40. EXAM TRENDS

Only show historical trends when backend has sufficient evidence.

If unavailable:

show a beautiful notebook empty/information state:

> Historical comparison requires at least two papers.

Never show empty fake charts.

---

# 41. ASK AI

Build a notebook-style RAG interface.

Example:

Student:

"Which topic has appeared most frequently?"

Response:

"Graph traversal appears in 4 historical papers..."

Then:

```text
Sources

2022 Paper — Q4 — Page 3
2023 Paper — Q5 — Page 4
2025 Paper — Q3 — Page 2
```

Sources must come from backend.

Never fabricate citations.

---

# 42. SOURCE ATTRIBUTION

RAG responses should display backend-provided:

* paper
* question
* page
* year
* evidence
* similarity/confidence if provided

Source cards should be clickable when possible.

Clicking source:

→ navigate PDF viewer.

---

# 43. STUDY INTELLIGENCE

Create:

`/student/study-intelligence`

Inputs:

* University
* College
* Branch
* Semester
* Subject
* Year

Support backend's SGBAU/Ram Meghe scoped fallback.

Clearly distinguish:

### Historical Intelligence

from:

### Curriculum-aware AI Guidance

Never make curriculum-aware Gemini output look like historical evidence.

---

# 44. MY NOTES

Create a beautiful notebook library.

Notes should look like physical study notebooks.

Show:

* title
* metadata
* uploaded date
* status
* open

Only student's own notes.

---

# 45. NOTE UPLOAD

PDF upload.

Required:

* title
* PDF

Show processing.

Use same pencil processing system.

---

# 46. NOTE PROCESSING

Use actual backend stages.

Do not fake progress.

Until READY:

the note cannot be used.

---

# 47. NOTE WORKSPACE

Split screen:

```text
---------------------------------------------------------
| PDF NOTE VIEWER      | NOTEBOOK AI                    |
|                      |                                |
| Actual PDF           | Summarize                      |
|                      | Ask Questions                  |
|                      | Diagram                        |
|                      | Key Concepts                   |
|                      | Important Points               |
|                      | Flashcards                     |
|                      | Quiz Me                         |
---------------------------------------------------------
```

The right panel should feel like a handwritten study notebook.

---

# 48. STRICT NOTE AI ISOLATION

This is ABSOLUTE.

When a student is inside a note:

AI may only use:

`student_id + note_id`

retrieval context.

It must NOT use:

* another note
* another student's note
* question papers
* historical exam data
* external knowledge

If the answer is not present:

display the backend-provided grounded response:

> "That information is not available in the selected note."

Do not add information from the frontend.

---

# 49. NOTE FEATURES

Implement:

### Summarize

* Quick
* Detailed
* Exam-focused

### Ask Questions

### Create Diagram

### Key Concepts

### Important Points

### Flashcards

### Quiz Me

All must use real backend endpoints.

---

# 50. FLASHCARDS

Create physical index-card aesthetics.

Front:

Question.

Back:

Answer.

Use Framer Motion for subtle flipping.

Example:

```text
┌───────────────────────────────┐
│ Front                         │
│                               │
│ What is the difference        │
│ between process and thread?  │
│                               │
│                    ☆         │
└───────────────────────────────┘
```

Do not make generic rectangular dashboard cards.

---

# 51. QUIZ

Create examination-notebook experience.

Question.

Options.

Answer.

Explanation where backend provides it.

Use subtle interaction animations.

---

# 52. DIAGRAM

Display generated diagrams on notebook paper.

Include:

* title
* diagram
* zoom
* download if backend supports it

---

# 53. AI LOADING INSIDE PANELS

Do NOT use a huge pencil animation inside the split-screen.

Use SM/XS.

Example:

```text
Important Topics

       [small pencil]

       Finding important topics...
```

The PDF viewer remains visible.

---

# 54. INDEPENDENT PANEL LOADING

PDF loading and AI loading must be independent.

If Important Topics is loading:

do NOT hide the PDF.

If PDF is loading:

do NOT unnecessarily hide AI data.

---

# 55. GLOBAL SEARCH

If supported by backend:

Search:

* papers
* questions
* topics
* subjects
* notes

Results should use notebook-inspired highlighting.

---

# 56. ROUTES

Implement role-aware routing.

Student:

```text
/login
/register

/student/dashboard
/student/papers
/student/papers/:id
/student/study-intelligence
/student/notes
/student/notes/:id
/student/assistant
/student/flashcards
/student/quizzes
/student/profile
/student/settings
```

Teacher:

```text
/teacher/dashboard
/teacher/papers
/teacher/papers/upload
/teacher/papers/:id
/teacher/processing
/teacher/profile
/teacher/settings
```

Adjust names if the actual backend/frontend repository already has an established route convention.

---

# 57. API ARCHITECTURE

Create a centralized API layer.

Use Axios.

Structure appropriately, for example:

```text
services/
  api/
    client.ts
    auth.ts
    papers.ts
    intelligence.ts
    notes.ts
    rag.ts
    chat.ts
    health.ts
```

Do not make arbitrary Axios requests inside components.

Centralize:

* base URL
* auth header
* refresh token
* interceptors
* errors
* API types

---

# 58. TYPESCRIPT

Create strong types for:

* User
* Role
* Paper
* PaperStatus
* ProcessingStage
* Question
* PaperAnalysis
* HistoricalAnalysis
* Topic
* RepeatedQuestion
* StudyRecommendation
* RAGResponse
* SourceReference
* Note
* NoteAnalysis
* Flashcard
* Quiz
* ChatSession
* ChatMessage
* APIResponse
* APIError

Avoid `any`.

---

# 59. STATE MANAGEMENT

Use Zustand or Redux Toolkit.

Centralize:

* authentication
* current user
* role
* selected paper
* selected note
* filters
* processing state
* chat
* UI state

Avoid unnecessary prop drilling.

---

# 60. PROCESSING POLLING

When processing:

poll the actual backend processing-status endpoint.

Stop polling when:

`READY`

or:

`FAILED`

Cancel polling when component unmounts.

Do not poll forever.

Do not use fake percentages.

---

# 61. ERROR HANDLING

Handle:

400

401

403

404

409

422

429

500

503

network failure

timeout

Display beautiful meaningful states.

Do not expose sensitive backend information.

---

# 62. EMPTY STATES

Do not use:

"No data found."

Instead:

Example:

> "Your notebook is still empty."

> "Upload your first paper to start building your academic intelligence archive."

Use a small academic doodle.

---

# 63. TOASTS

Centralized toast system.

Examples:

"Paper uploaded successfully."

"Paper processing started."

"Paper is ready."

"Processing failed."

"Note uploaded."

"Note ready."

"Session expired."

Keep the toast style consistent with the product.

---

# 64. ANIMATION LANGUAGE

Use Framer Motion.

Animation personality:

> ink + paper + subtle movement

Use for:

* page transitions
* tabs
* sticky notes
* cards
* notebook pages
* flashcards
* AI responses
* processing transitions

Avoid:

* bouncing everything
* huge entrance animations
* particle overload
* constant movement
* flashy effects

---

# 65. RESPONSIVE DESIGN

Desktop:

true split-screen.

Mobile:

do NOT squeeze two panes.

Use:

```text
[ PDF ]

[ AI Intelligence ]
```

as a tab/switcher.

Tablet:

adaptive split.

The UI must work on:

* desktop
* laptop
* tablet
* mobile

---

# 66. ACCESSIBILITY

Implement:

* semantic HTML
* keyboard navigation
* visible focus
* ARIA labels
* accessible buttons
* sufficient contrast
* reduced motion
* screen-reader-friendly processing status

---

# 67. PERFORMANCE

Implement:

* lazy routes
* code splitting
* optimized PDF rendering
* debounced search
* controlled polling
* abort controllers
* memoization where useful
* caching where appropriate
* minimal unnecessary rerenders

---

# 68. SECURITY

Never expose:

* Gemini API key
* database credentials
* backend secrets

Handle:

* token expiration
* unauthorized responses
* logout
* protected routes

Frontend authorization is UX/security layering only; backend remains authoritative.

---

# 69. COMPONENT ARCHITECTURE

Create reusable components such as:

```text
AppShell
Sidebar
TopBar
PaperCard
NoteCard
NotebookSurface
NotebookHeading
HandwrittenLabel
Highlighter
Underline
StickyNote
PaperClip
Tape
Doodle
PaperViewer
IntelligencePanel
IntelligenceTabs
TopicCard
RepeatedQuestionCard
TrendChart
StudyPriorityCard
AIChat
SourceCitation
DocumentUploader
DocumentProcessingAnimation
ProcessingTimeline
Flashcard
QuizCard
EmptyNotebook
ErrorState
LoadingState
```

Do not build massive monolithic components.

---

# 70. VISUAL COMPONENT DETAILS

## PaperCard

Should resemble an archived exam sheet.

## NoteCard

Should resemble a study notebook.

## TopicCard

Should resemble a highlighted notebook section.

## RepeatedQuestionCard

Should resemble an annotated exam question.

## StickyNote

Should look physically attached to the page.

## Flashcard

Should resemble an index card.

## AIChat

Should feel like handwritten Q&A notes.

---

# 71. PAPER VIEWER ↔ AI INTERACTION

This interaction is extremely important.

When AI identifies:

"Trees — Page 4"

the student should be able to click it.

The PDF viewer should navigate to:

Page 4.

If question coordinates/anchors are available:

use them.

The experience should feel like:

> "AI found this exact thing in my paper."

---

# 72. HISTORICAL EVIDENCE VISUAL LANGUAGE

Clearly distinguish:

### Evidence

from:

### AI Interpretation

For example:

```text
HISTORICAL EVIDENCE

Appeared in 4 of 5 papers
2021 • 2022 • 2024 • 2025
```

Then:

```text
AI STUDY INSIGHT

High-priority topic for revision.
```

This distinction must be visually obvious.

---

# 73. NOTE EVIDENCE VISUAL LANGUAGE

For note AI:

```text
FROM YOUR NOTE

Page 7
"Process scheduling..."
```

Never imply information came from the note if it did not.

---

# 74. DARK MODE

If the existing application supports dark mode:

create a sophisticated dark academic mode.

Do NOT invert the notebook literally.

Use:

* charcoal background
* warm paper
* muted ink
* soft accents

Light mode remains the primary notebook experience.

---

# 75. NO TEMPLATE FEEL

This is important.

Do not simply install a component library and produce a dashboard.

The frontend must have its own visual identity.

Someone should be able to see a screenshot and immediately recognize:

> "That's EduArchive."

---

# 76. BACKEND CONTRACT COVERAGE

Audit the backend and make sure the frontend provides UI for every user-facing capability.

Backend functionality includes:

### Authentication

* register
* login
* refresh
* logout
* me

### Teacher

* paper upload
* paper listing
* paper detail
* analysis
* delete
* retry

### Student

* papers
* paper detail
* analysis
* PDF
* intelligence
* study intelligence
* subject intelligence
* historical analysis
* question search

### Processing

* paper processing status
* note processing status

### RAG

* query

### Chat

* sessions
* messages
* ask

### Notes

* upload
* list
* detail
* delete
* analysis
* query
* summarize
* diagram
* key concepts
* important points
* flashcards
* quiz
* retry

### Health

* health
* database
* Chroma
* AI

Do not omit user-facing functionality.

---

# 77. IMPORTANT BACKEND BEHAVIOR

Respect the backend's historical rule:

Historical intelligence requires:

**2+ READY papers**

for the same:

* university
* college
* branch
* semester
* subject

Year is metadata, not the grouping criterion.

Do not implement a conflicting frontend rule.

---

# 78. SGBAU / RAM MEGHE

Where the backend invokes curriculum-aware fallback:

the UI must clearly identify it as:

### Curriculum-aware AI guidance

for the configured:

**Sant Gadge Baba Amravati University**

and:

**Ram Meghe College**

scope.

Never present fallback guidance as historical evidence.

---

# 79. REAL PDF EXPERIENCE

Students must interact with the actual PDF.

Teachers upload actual PDFs.

Notes are actual PDFs.

Do not convert everything into fake HTML documents.

---

# 80. VISUAL HIERARCHY

The interface should prioritize:

1. Current academic document
2. AI intelligence
3. Important insight
4. Source/evidence
5. Secondary metadata

Do not let navigation overpower study content.

---

# 81. DESKTOP SPLIT-SCREEN PROPORTION

For the main study workspace, start around:

```text
45% PDF
55% AI notebook
```

or an adaptive:

```text
minmax(380px, 0.9fr)
minmax(420px, 1.1fr)
```

depending on viewport.

The PDF must remain comfortably readable.

The AI notebook must have enough width for handwritten content.

Make the divider resizable if practical.

---

# 82. STICKY NOTES POSITIONING

Sticky notes should be used around the notebook surface:

* top corner
* right edge
* section header
* exam tip area

Do NOT randomly position sticky notes over important text.

Avoid obstructing content.

---

# 83. PAPER CLIPS / TAPE

Use sparingly.

Examples:

* note cards
* uploaded paper cards
* flashcards
* special insights

They are decorative.

Never interfere with interaction.

---

# 84. DOODLES

Use small SVG/Lucide/custom doodles:

* pencil
* star
* bulb
* book
* arrow
* graph
* calculator
* graduation cap
* checkmark
* paper

Do not use stock illustrations everywhere.

---

# 85. MOBILE STUDY EXPERIENCE

On mobile:

Top:

Paper title.

Then:

```text
[PDF] [AI]
```

Switch between the actual PDF and AI notebook.

Do not attempt to show both at full width.

---

# 86. LOADING LAYOUT RULE

Loading states must preserve layout.

No layout jumps.

Reserve appropriate animation space.

Button widths must not change because of loading.

Cards must not resize unpredictably.

---

# 87. AI THINKING STATE

For small AI operations:

Use the pencil XS/SM.

Example:

```text
[small pencil]

Reading your notes...
```

This becomes part of the EduArchive identity.

---

# 88. FINAL UI QUALITY BAR

The final application should feel like:

**Notion**

meets

**premium EdTech**

meets

**digital handwritten notebook**

meets

**AI research assistant**

But it must remain distinctly EduArchive.

---

# 89. FINAL IMPLEMENTATION PROCESS

Follow this order.

## PHASE 1

Audit repository.

## PHASE 2

Audit backend API.

## PHASE 3

Establish frontend architecture.

## PHASE 4

Create design tokens.

## PHASE 5

Create typography system.

## PHASE 6

Create notebook visual system.

## PHASE 7

Create application shell.

## PHASE 8

Implement authentication.

## PHASE 9

Implement teacher workflow.

## PHASE 10

Implement student workflow.

## PHASE 11

Implement Paper Vault.

## PHASE 12

Implement PDF study workspace.

## PHASE 13

Implement AI intelligence.

## PHASE 14

Implement RAG.

## PHASE 15

Implement Study Intelligence.

## PHASE 16

Implement Notes.

## PHASE 17

Implement Note AI.

## PHASE 18

Implement Flashcards.

## PHASE 19

Implement Quiz.

## PHASE 20

Implement all processing states.

## PHASE 21

Implement responsive behavior.

## PHASE 22

Implement accessibility.

## PHASE 23

Integrate all APIs.

## PHASE 24

Run full build.

## PHASE 25

Perform complete frontend audit.

---

# 90. FINAL SELF-AUDIT

After implementation, do NOT assume the work is complete.

Inspect the entire frontend again.

Verify:

### Authentication

* login works
* registration works
* refresh works
* logout works
* role protection works

### Teacher

* upload
* metadata
* processing
* status
* retry
* delete
* analysis

### Student

* dashboard
* Paper Vault
* filtering
* paper opening
* PDF viewer
* intelligence
* historical intelligence
* RAG
* Study Intelligence

### Notes

* upload
* processing
* status
* retry
* PDF viewer
* summarize
* ask
* diagram
* key concepts
* important points
* flashcards
* quiz

### AI

* loading
* success
* errors
* sources
* evidence
* fallback

### UX

* empty states
* error states
* loading states
* mobile
* tablet
* desktop
* accessibility
* reduced motion

---

# 91. BUILD VALIDATION

Run:

* TypeScript check
* production build
* lint
* tests if available

Fix:

* all TypeScript errors
* all runtime errors
* all console errors
* all broken imports
* all broken routes
* all API mismatches
* all layout overflow
* all responsive issues

Do not finish with warnings that could have been fixed.

---

# 92. FINAL REQUIREMENT

Before declaring completion, perform a final repository-wide search for:

```text
TODO
FIXME
mock
dummy
placeholder
sampleData
fakeData
fakeProgress
setTimeout
setInterval
any
```

Review every match.

Not every occurrence necessarily represents a problem, but every production implementation must be verified.

Remove all unnecessary placeholders and development artifacts.

---

# 93. ABSOLUTE FINAL INSTRUCTION

Do not stop at "the main pages are done."

Do not stop after creating screenshots.

Do not stop after implementing the dashboard.

Build the COMPLETE frontend.

Every:

* page
* route
* component
* API integration
* loading state
* processing state
* error state
* empty state
* interaction
* AI feature
* notebook component
* responsive state
* authentication flow
* role restriction

must be implemented.

The final result must be:

> **A real, production-quality EduArchive AI 2.0 frontend connected to the existing backend, with a premium modern application shell and a distinctive handwritten digital-notebook study experience.**

The provided notebook reference and EduArchive UI concept are the visual north star.

The backend is the functional source of truth.

The frontend must bring both together into one polished product.

Do not leave anything incomplete.
