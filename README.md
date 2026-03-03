# VibeCode Editor

## Overview

VibeCode Editor is a browser-based AI-powered code editor and playground. It lets authenticated users create isolated coding environments (playgrounds) from a set of popular framework templates, edit files in-browser using Monaco Editor, execute code via WebContainers, and get contextual AI assistance through a built-in chat panel.

The project addresses the gap between static code sandboxes and a full local development setup — users can write, run, and get AI feedback on code entirely in the browser, without installing anything.

It is aimed at developers who want a quick, shareable environment to prototype ideas or experiment with a new framework.

---

## Features

- **OAuth Authentication** — Sign in with Google or GitHub via NextAuth v5 (JWT strategy)
- **Protected Routing** — Middleware-based route guards redirect unauthenticated users; authenticated users bypass auth pages automatically
- **Dashboard** — View, search, and manage all personal playgrounds in a sortable table
- **Star / Bookmark Playgrounds** — Toggle a star mark on any playground for quick access
- **Template Selection** — Create a new playground from six pre-configured templates: React, Next.js, Express, Vue.js, Hono, and Angular
- **Monaco Editor** — Full-featured in-browser code editor with syntax highlighting, language detection per file extension, and smooth caret animations
- **AI Inline Completions** — Context-aware code suggestions fetched from `/api/code-suggestion`, shown as inline ghost text; accept with `Tab`, reject with `Escape`
- **AI Chat Side Panel** — Conversational AI assistant (backed by `/api/chat`) with four modes: Chat, Code Review, Error Fix, and Optimize; supports file attachments, drag-and-drop, and clipboard paste detection for code files
- **WebContainer Terminal** — Embedded xterm.js terminal connected to a WebContainer instance; supports command history (↑/↓), Ctrl+C process interrupt, search, copy, clear, and terminal log download
- **Resizable Panel Layout** — File tree, editor, and terminal panels are independently resizable
- **File Tree Explorer** — Navigate, create, rename, and delete files and folders within a playground
- **Persistent Playground State** — File contents serialised as JSON and stored in PostgreSQL via Prisma; playgrounds reload saved content on next visit
- **Theme Support** — Light and dark mode via `next-themes`
- **Role-based User Model** — Users are assigned `USER`, `ADMIN`, or `PREMIUM_USER` roles stored in the database

---

## Tech Stack

| Category               | Technology                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| **Framework**          | Next.js 15 (App Router)                                             |
| **Language**           | TypeScript 5                                                        |
| **Auth**               | NextAuth v5 (Auth.js) — Google & GitHub OAuth, JWT sessions         |
| **Database**           | PostgreSQL (via `pg`)                                               |
| **ORM**                | Prisma 7 with `@prisma/adapter-pg`                                  |
| **Code Editor**        | Monaco Editor (`@monaco-editor/react`)                              |
| **In-browser Runtime** | WebContainers API (`@webcontainer/api`)                             |
| **Terminal**           | xterm.js (`@xterm/xterm`) with FitAddon, SearchAddon, WebLinksAddon |
| **AI Chat**            | Gemini API (via `/api/chat` and `/api/code-suggestion` routes)      |
| **UI Components**      | shadcn/ui (Radix UI primitives)                                     |
| **Styling**            | Tailwind CSS v4                                                     |
| **State Management**   | Zustand                                                             |
| **Forms**              | React Hook Form + Zod                                               |
| **Markdown Rendering** | react-markdown, remark-gfm, remark-math, rehype-katex               |
| **Notifications**      | Sonner                                                              |
| **Icons**              | Lucide React, React Icons                                           |
| **Animations**         | tw-animate-css                                                      |

---

## Installation

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- Google OAuth credentials
- GitHub OAuth credentials
- A Gemini API key (for AI features)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/ShubhamSingh-dev/VibeCodeEditor.git
cd VibeCodeEditor
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file at the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname

AUTH_SECRET=your_nextauth_secret

AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

GEMINI_API_KEY=your_gemini_api_key
```

4. **Run database migrations**

```bash
npx prisma migrate deploy
```

5. **Generate the Prisma client**

```bash
npx prisma generate
```

6. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** WebContainers require the `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers, which are configured automatically in `next.config.ts`.

---

## Usage

1. Visit the landing page and click **Get Started**.
2. Sign in with your Google or GitHub account.
3. On the **Dashboard**, click the **New Playground** button.
4. Choose a framework template (React, Next.js, Express, Vue.js, Hono, or Angular) and give the project a name.
5. The playground opens with a pre-scaffolded file tree on the left, the Monaco editor in the center, and a terminal at the bottom.
6. Edit any file — AI inline suggestions appear automatically; press `Tab` to accept.
7. Open the **AI Chat** panel (via the toggle button) to ask questions, request a code review, or get optimisation suggestions.
8. Use the integrated terminal to run commands (e.g., `npm install`, `npm run dev`) inside the WebContainer.
9. Changes are saved back to the database; the playground resumes from the last saved state on next visit.

---

## Project Structure

```
.
├── app/                        # Next.js App Router pages and API routes
│   ├── (auth)/                 # Sign-in page (public)
│   ├── (root)/                 # Landing page (public)
│   ├── dashboard/              # Authenticated dashboard page
│   ├── playground/             # Authenticated playground editor page
│   └── api/
│       ├── auth/               # NextAuth route handler
│       ├── chat/               # AI chat endpoint
│       ├── code-suggestion/    # AI inline completion endpoint
│       └── template/           # Template file loader endpoint
├── features/                   # Feature-sliced modules
│   ├── ai-chat/                # AI chat panel, code blocks, file attachment UI
│   ├── auth/                   # Auth actions, sign-in form, user/logout buttons
│   ├── dashboard/              # Dashboard components, project table, star toggle
│   ├── home/                   # Landing page header and footer
│   ├── playground/             # Editor, file tree, terminal, AI toggle, hooks, editor config
│   └── webContainers/          # WebContainer boot hooks and service
├── components/
│   ├── ui/                     # shadcn/ui component library
│   └── providers/              # Theme and session providers
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── template.ts             # Template loader utility
│   └── utils.ts                # cn() utility
├── prisma/
│   ├── schema.prisma           # Database schema (User, Account, Playground, TemplateFile, StarMark)
│   └── migrations/             # SQL migration history
├── vibecode-starters/          # Starter file trees for each framework template
├── auth.ts                     # NextAuth configuration and callbacks
├── auth.config.ts              # OAuth provider config (edge-compatible)
├── middleware.ts               # Route protection middleware
└── routes.ts                   # Public, auth, and protected route definitions
```

---

## What I Learned

### Technical Skills Demonstrated

- **Next.js App Router** — Layouts, server components, server actions, and route handlers used together in a single codebase
- **Authentication flow** — Implementing OAuth with NextAuth v5, custom JWT callbacks to embed user role into the session token, and middleware-based route protection without session overhead on every request
- **WebContainers API** — Booting an in-browser Node.js runtime, spawning processes, and piping I/O to an xterm.js terminal; understanding the COOP/COEP header requirements
- **Monaco Editor internals** — Registering a custom inline completions provider, handling Tab key override without breaking normal indentation, and switching language modes programmatically per file
- **Prisma with PostgreSQL** — Designing a relational schema with cascading deletes, storing JSON file-tree snapshots as a `Json` column, and using the `@prisma/adapter-pg` driver adapter
- **Feature-sliced architecture** — Organising code by domain (auth, dashboard, playground, ai-chat) rather than by file type, keeping each feature self-contained with its own components, hooks, and actions

### Challenges Solved

- **Duplicate AI suggestion insertion** — Monaco's inline completion provider and manual `executeEdits` could both insert text. Solved with a debounce flag (`isAcceptingSuggestionRef`) and a text-equality check before inserting.
- **WebContainer COOP/COEP headers** — The WebContainers API requires `SharedArrayBuffer`, which demands specific cross-origin isolation headers. These are applied globally in `next.config.ts`.
- **JWT vs Database session trade-off** — Chose JWT sessions to avoid a session table and reduce latency on every request, while still storing user role in the token via the `jwt` callback.

---

## Future Improvements

1. **Real-time collaboration** — Allow multiple users to edit the same playground simultaneously using CRDTs or operational transforms (e.g., Yjs)
2. **AI streaming responses** — Stream chat responses token-by-token instead of waiting for the full reply, improving perceived latency
3. **Import from GitHub** — Let users seed a playground directly from a public GitHub repository URL
4. **Playground sharing** — Generate shareable read-only or fork-able links for any playground
5. **Premium tier enforcement** — Use the existing `PREMIUM_USER` role to gate features such as larger file limits, additional templates, or higher AI request quotas
