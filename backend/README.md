# College Collab — Backend

Backend for the College Collaboration web app (student projects, mentor verification, placement auto-apply).  
Built with **Bun + TypeScript + Express + Prisma + PostgreSQL**.

---

## Features (current)

- User auth (placeholder endpoints ready to extend)
- Projects (create / list / detail placeholders)
- Join requests, project files, verifications (DB models defined via Prisma)
- Swagger UI (`/docs`) that serves `openapi.yaml`
- Prisma models + client
- Ready-to-use folder structure for adding routes, controllers, services

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Common commands](#common-commands)
- [Prisma (DB) workflow](#prisma-db-workflow)
- [Swagger / API docs](#swagger--api-docs)
- [Development notes & troubleshooting](#development-notes--troubleshooting)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Prerequisites

- **Bun** (recommended) — https://bun.sh  
  or Node.js (LTS) + npm/yarn if you prefer to run Prisma via `npx`.
- **PostgreSQL** running and accessible
- (Optional) VS Code or another editor

---

## Quickstart

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/<repo>.git
   cd backend
   ```

2️⃣ Install Dependencies

Using Bun (recommended):

```
bun install
```

or using npm:

```
npm install
```

3️⃣ Create Environment File

Create a .env file in the backend/ directory with the following content:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/college_db?schema=public
JWT_SECRET=replace-with-a-secure-secret
PORT=4000
```

4️⃣ Initialize Prisma

```
npx prisma generate --schema ./prisma/schema.prisma
npx prisma db push --schema ./prisma/schema.prisma

```

or, for migrations:

```
npx prisma migrate dev --name init --schema ./prisma/schema.prisma

```

5️⃣ Start the Development Server

```
bun run dev
```

Your terminal will display clickable links:

```
🚀 Server is up and running!
🟢 API Base:        http://localhost:4000
📘 Swagger Docs:    http://localhost:4000/docs
🔐 Auth Routes:     http://localhost:4000/api/auth/signup
📂 Project Routes:  http://localhost:4000/api/projects
✨ Press Ctrl+Click on any URL above to open it in your browser.

```

📘 API Documentation

Swagger UI is available at:

```
http://localhost:4000/docs

```

The API documentation is powered by swagger-ui-express and automatically loads the openapi.yaml specification from the project root.

🧩 Folder Structure

```
backend/
├── openapi.yaml
├── prisma/
│   ├── schema.prisma
│   └── prisma.config.ts
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── config/
│   │   └── index.ts
│   ├── db/
│   │   └── prismaClient.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   └── docs.routes.ts
│   ├── controllers/
│   ├── services/
│   └── utils/
├── .env
├── .gitignore
├── package.json
└── README.md
```
