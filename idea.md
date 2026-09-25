# Project Overview: Pivoa

You are an expert full-stack developer and software architect. We are building a modern web application called **Pivoa**, a smart personal finance and expense tracking platform.

The core mission of Pivoa is to give users absolute control over their finances through a clean dashboard, manual expense entry, and AI-powered receipt scanning.

## Tech Stack

- **Frontend:** React (using Vite) + React Router + Typescript + Tailwind CSS (using shadcn/ui for components).
- **Backend:** Node.js using NestJS (strict TypeScript).
- **Database:** Supabase. **Decision:** We will use **PostgreSQL** (Relational SQL) through Supabase. Financial data (transactions, users, categories) requires strict relational integrity, ACID compliance, and structured queries, making SQL the correct choice over NoSQL.
- **AI/OCR Service:** We will use an AI Vision API (e.g., OpenAI gpt-4o vision or a dedicated OCR API) to extract data from receipts (this might be the last feature to implement since we need API keys. you'll give suggestions as to what other AI can we use to achieve this).

## Agent Directives (CRITICAL)

1. **Phased Execution:** Do not attempt to build the entire application in one shot. We will work in strict phases. Wait for my approval before moving from one phase to the next.
2. **Best Practices:** Use modern, functional React components with Hooks. For NestJS, strictly follow its modular architecture (Controllers, Services, Modules).
3. **Typing:** Use strict TypeScript interfaces/types shared between the frontend and backend where possible.
4. **Environment Variables:** Never hardcode secrets. Always use `.env` files and document the required keys in a `.env.example` file.

---

## Development Roadmap & Phases

### Phase 1: Project Initialization & Infrastructure

- Initialize the Supabase project and create the SQL schema. The schema should include tables for: `users`, `categories`, and `expenses` (fields: id, user_id, amount, currency, category_id, vendor, date, receipt_image_url, notes).
- Bootstrap the NestJS backend and connect it to Supabase via the official Supabase JS client or Prisma ORM.
- Bootstrap the React Vite frontend, set up React Router, and install Tailwind CSS.
- **Goal:** Both servers (Frontend & Backend) are running, connected to the DB, and can communicate via a basic `/api/health` health-check endpoint.

### Phase 2: Authentication & User Setup

- Implement Supabase Auth (Email/Password).
- Create the backend guards/middleware in NestJS to protect API routes using Supabase JWTs.
- Create the frontend login/register pages and set up a protected route wrapper in React Router.
- Create the Landing Page for the application with good informational sections. Choose images from the web to use across the landing page. Give me suggestions as to where can I
  generate logos for the app.
- **Goal:** A user can sign up, log in, and access a protected empty "Dashboard" page. A great landing page is created

### Phase 3: Core CRUD & Manual Expense Entry

- Seed default categories in the database (e.g., Food, Transport, Utilities, Entertainment).
- **Backend:** Create NestJS REST endpoints to Create, Read, Update, and Delete (CRUD) expenses.
- **Frontend:** Build a clean "Add Expense" form (manual entry) and a table/list to display recent expenses.
- **Goal:** A user can manually log an expense, assign it to a category, and view it on the screen. Icons are use throught the app to not only view the expenses or KPIs on boring text

### Phase 4: AI Receipt Scanning (The Magic Feature)

- **Backend:** Implement an endpoint in NestJS that accepts an image upload. It should upload the image to Supabase Storage, retrieve the public URL, and pass it to an AI Vision API (like OpenAI). Instruct the AI to return a strictly formatted JSON object containing: `amount`, `vendor`, `date`, and a suggested `category`.
- **Frontend:** Add an image dropzone/camera capture button to the "Add Expense" interface. Show a loading state while the AI processes the receipt, and auto-fill the manual form with the AI's JSON response so the user can verify it before saving.
- **Goal:** A user can upload a receipt, the AI parses it, and the data populates the expense form automatically. Befor final expense post, user can review it and make changes if necessary

### Phase 5: The Pivoa Dashboard & Analytics

- **Backend:** Create aggregation endpoints (e.g., total spent this month, spending by category, month-over-month trend).
- **Frontend:** Build the main Dashboard UI. Use a charting library (like Recharts or Chart.js) to display:
  - A summary card for Total Monthly Spend.
  - A Pie Chart showing expenses by Category.
  - A Bar/Line chart showing daily/weekly spending trends.
- **Goal:** When the user logs in, they see a beautiful, data-rich dashboard summarizing their financial health.

---

**Initial Prompt for AI:**
I am ready to begin. Please acknowledge you understand these instructions, the tech stack, and the agent directives. Once acknowledged, provide the step-by-step terminal commands to execute **Phase 1** (initializing the monorepo, NestJS, and React Vite environments).
