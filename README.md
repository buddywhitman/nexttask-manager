# NextTask — High Performance Kanban Task Manager

NextTask is a premium, high-fidelity Kanban-style Task Manager application built to track tasks across three stages: **Todo**, **In Progress**, and **Done**. It features user authentication (registration & login), secure session token handling, full CRUD capabilities for tasks, and a responsive glassmorphic dark-theme user interface.

## Live Deployments

- **Frontend (Vercel)**: *[Deployment URL to be linked here]*
- **Backend (Railway)**: *[Deployment URL to be linked here]*

## Technical Architecture & Decisions

The project is structured as a monorepo separated into two primary directories:
- **`backend/`**: A RESTful Express API written in TypeScript.
- **`frontend/`**: A Vite-powered React SPA.

### Key Decisions & Stack Choices

1. **Vite + React (Frontend)**: Standard React SPA using Vite for blistering fast development cycles (HMR) and optimized static production builds that load in milliseconds.
2. **Express + TypeScript (Backend)**: Built with Express for a lightweight, robust custom REST API. TypeScript is enforced on both frontend and backend for compile-time safety and type alignment.
3. **Prisma ORM & Neon PostgreSQL (Database)**: Neon provides a serverless PostgreSQL database with branch support. Prisma was chosen as the database mapper to ensure type-safe database queries.
4. **JWT Authentication**: Users register/log in and receive a JSON Web Token (JWT) that expires in 7 days. Passwords are safe and hashed using `bcryptjs`. The frontend attaches this token to the `Authorization: Bearer <token>` header for all authenticated queries.
5. **Vanilla CSS Styling**: In compliance with strict design rules, this application does not use TailwindCSS. We built a custom design system in Vanilla CSS using CSS Custom Properties (Variables), backdrop filters for a sleek glassmorphic effect, flexible Flexbox/Grid layouts, and smooth keyframe micro-animations.

### Technical Assumptions & Tradeoffs

- **Security vs. Complexity**: We chose JWT-based authentication stored in `localStorage` for rapid implementation and seamless stateless authentication. While cookie-based HTTPOnly sessions are slightly more secure against XSS, local token storage offers superior ease of cross-domain integration for split deployments (Vercel frontend calling Railway backend).
- **Drag & Drop**: We leveraged the native HTML5 Drag and Drop API to minimize external dependencies. For tablets and mobile screens where dragging is difficult, we added helper action buttons on each card to transition stages manually, which drastically improves mobile UX.
- **Cascading Deletes**: We configured Prisma to automatically cascade delete tasks if a user deletes their account.

---

## Folder Structure

```
task-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Express controllers (auth, task)
│   │   ├── middleware/       # Express middlewares (JWT check)
│   │   ├── db.ts             # Prisma client instance
│   │   └── server.ts         # Server setup & routes
│   ├── prisma/
│   │   └── schema.prisma     # DB Schema (User, Task, Stage)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Board and Task Card elements
│   │   ├── api.ts            # Frontend client endpoints
│   │   ├── index.css         # CSS Variables and Layout Styles
│   │   └── App.tsx           # Global state manager
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- A running PostgreSQL database instance (or use the configured Neon connection details)

### 1. Database Setup
The backend is already configured to connect to our Neon PostgreSQL database. You can customize the connection details in `backend/.env`.

### 2. Backend Setup
1. Open your terminal in the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations to prepare the database schema:
   ```bash
   npm run prisma:push
   ```
4. Start the backend development server (listens on port 5000):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal in the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (requires peer override for React 19 packages):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React app:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (typically `http://localhost:5173`) in your browser.

---

## Production Deployment

### Frontend (Vercel)
1. Hook your GitHub repository to Vercel.
2. Select the `frontend` subdirectory as the root directory.
3. Configure the `VITE_API_URL` environment variable pointing to your deployed Railway backend URL (e.g. `https://your-backend.railway.app/api`).
4. Vercel will automatically build and serve the application.

### Backend (Railway)
1. Create a new service on Railway connected to your GitHub repo.
2. Select the `backend` subdirectory as the root directory.
3. Configure environment variables in Railway:
   - `DATABASE_URL`: Your production Postgres URL.
   - `JWT_SECRET`: A secure long random string.
   - `PORT`: Railway will inject this automatically.
4. Railway will automatically deploy the service based on the root-level scripts.
