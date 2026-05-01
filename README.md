# 🚀 TaskFlow — Team Task Manager

A full-stack web application where teams can create projects, assign tasks, and track progress with role-based access control (Admin/Member). Built with a **Node.js + Express + SQLite** backend and a **React + Tailwind CSS** frontend featuring drag-and-drop Kanban boards.

---

## 📸 Quick Start

```bash
# 1. Clone and install server
cd server
npm install
npm start          # → http://localhost:3000

# 2. In a new terminal, install and start client
cd client
npm install
npm run dev        # → http://localhost:5173
```

### 🔑 Demo Credentials (auto-seeded)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@demo.com` | `password123` |
| **Member** | `member@demo.com` | `password123` |

> The database is auto-seeded on first run with 3 users, 2 projects, and 12 tasks across all statuses and priorities. Click the **"👑 Demo Admin"** or **"👤 Demo Member"** buttons on the login page for one-click access.

---

## ⚙️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Node.js + Express.js | Lightweight REST API, clean route/middleware architecture |
| **Database** | SQLite (via sql.js) | Zero-config, file-based SQL — easy to run, proves SQL proficiency |
| **Auth** | JWT + bcryptjs | Industry-standard stateless authentication with hashed passwords |
| **Frontend** | React 19 (Vite) | Component-based architecture, hooks for state management |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with custom theme tokens for premium UI |
| **Drag & Drop** | @dnd-kit | Accessible, performant Kanban board with optimistic updates |
| **Routing** | React Router v7 | SPA navigation with protected route guards |
| **HTTP** | Axios | Request/response interceptors for JWT + error handling |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│  React Frontend (Vite, port 5173)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ AuthPage │ │Dashboard │ │  ProjectView     │  │
│  │          │ │ StatCards│ │  KanbanBoard     │  │
│  │ Login/   │ │ Charts  │ │  (drag & drop)   │  │
│  │ Signup   │ │ MyTasks  │ │  MemberPanel     │  │
│  └──────────┘ └──────────┘ └──────────────────┘  │
│           ↕ Axios + JWT Interceptor               │
├──────────────────────────────────────────────────┤
│  Express Backend (port 3000)                      │
│  ┌────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Auth  │ │ Projects │ │   Tasks / Members  │  │
│  │ Routes │ │  Routes  │ │      Routes        │  │
│  └────┬───┘ └────┬─────┘ └────────┬───────────┘  │
│       │    Middleware (JWT + RBAC) │               │
│       └──────────┬────────────────┘               │
│           SQLite Database (sql.js)                │
└──────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
├── server/
│   ├── server.js              # Express entry point
│   ├── db/
│   │   ├── schema.sql         # SQL table definitions
│   │   ├── database.js        # SQLite init + seed data
│   │   └── helpers.js         # Query helper wrappers
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── rbac.js            # Role-based access checks
│   ├── routes/
│   │   ├── auth.js            # POST /signup, /login, GET /me
│   │   ├── projects.js        # CRUD /projects
│   │   ├── members.js         # /projects/:id/members
│   │   ├── tasks.js           # /projects/:id/tasks
│   │   └── dashboard.js       # GET /dashboard (stats)
│   └── utils/
│       └── validators.js      # Input validation helpers
│
├── client/
│   ├── vite.config.js         # Vite + React + Tailwind + API proxy
│   ├── src/
│   │   ├── App.jsx            # Routes + auth guards
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Tailwind + custom theme + animations
│   │   ├── api/axios.js       # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx  # Global auth state
│   │   ├── components/        # Reusable UI components
│   │   │   ├── KanbanBoard.jsx    # DnD board with optimistic updates
│   │   │   ├── KanbanColumn.jsx   # Droppable column
│   │   │   ├── TaskCard.jsx       # Draggable task card
│   │   │   ├── TaskModal.jsx      # Create/edit task form
│   │   │   ├── ProjectModal.jsx   # Create/edit project form
│   │   │   ├── MemberPanel.jsx    # Team management (admin)
│   │   │   ├── StatCard.jsx       # Animated stat counter
│   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   ├── Layout.jsx         # App shell
│   │   │   ├── Toast.jsx          # Notifications
│   │   │   └── ProtectedRoute.jsx # Auth guard
│   │   └── pages/
│   │       ├── AuthPage.jsx       # Login / Signup
│   │       ├── Dashboard.jsx      # Stats + activity feed
│   │       └── ProjectView.jsx    # Kanban board + members
│   └── index.html
│
└── README.md
```

---

## 🔐 Role-Based Access Control

| Action | Admin | Member |
|--------|:-----:|:------:|
| Create project | ✅ | ✅ |
| Edit/Delete project | ✅ | ❌ |
| Add/Remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update own tasks | ✅ | ✅ |
| Reassign tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |

The project creator is automatically assigned the **Admin** role. Admins can invite members by email and toggle roles.

---

## 🛣️ API Endpoints

### Auth
- `POST /api/auth/signup` — Register (name, email, password) → JWT
- `POST /api/auth/login` — Login (email, password) → JWT
- `GET /api/auth/me` — Current user profile

### Projects
- `GET /api/projects` — User's projects (with task/member counts)
- `POST /api/projects` — Create project (auto-admin)
- `GET /api/projects/:id` — Project details
- `PUT /api/projects/:id` — Update (admin only)
- `DELETE /api/projects/:id` — Delete (admin only)

### Members
- `GET /api/projects/:id/members` — List members
- `POST /api/projects/:id/members` — Add by email (admin)
- `PUT /api/projects/:id/members/:userId` — Change role (admin)
- `DELETE /api/projects/:id/members/:userId` — Remove (admin)

### Tasks
- `GET /api/projects/:id/tasks` — List (filter by status/priority/assignee)
- `POST /api/projects/:id/tasks` — Create task
- `PUT /api/projects/:id/tasks/:taskId` — Update task
- `DELETE /api/projects/:id/tasks/:taskId` — Delete (admin)

### Dashboard
- `GET /api/dashboard` — Aggregated stats, my tasks, recent activity

---

## ✨ Key Features

- **Drag-and-drop Kanban board** — Move tasks between To Do → In Progress → Review → Done with optimistic UI updates
- **Role-based access** — Admins manage team and tasks; Members work on assigned items
- **Real-time dashboard** — Animated stat counters, SVG donut chart, overdue tracking
- **Glassmorphism dark UI** — Frosted glass cards, gradient accents, smooth animations
- **Demo-ready** — Pre-seeded data, one-click demo login buttons
- **Input validation** — Server-side validation on all endpoints with clear error messages
- **Responsive design** — Works across desktop viewports

---

## 📝 Notes

- The SQLite database file (`taskmanager.db`) is auto-created in the `server/` directory on first run
- To reset the database, simply delete `server/taskmanager.db` and restart the server
- The Vite dev server proxies `/api` requests to the Express backend (port 3000)
- JWT tokens expire after 7 days and are stored in `localStorage`
