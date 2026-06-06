# VendorBridge — Procurement Portal

> A full-stack procurement management system built with React, Express.js, and PostgreSQL via Prisma ORM. Covers the complete purchase lifecycle: Vendor onboarding → RFQ creation → Quotation submission → Approval workflow → Purchase Order generation → Invoice management.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [Frontend — Detailed Guide](#5-frontend--detailed-guide)
   - [Entry Point](#51-entry-point)
   - [App.jsx — Root Controller](#52-appjsx--root-controller)
   - [Routing Strategy](#53-routing-strategy)
   - [Role-Based Navigation](#54-role-based-navigation)
   - [Pages](#55-pages)
   - [Shared Components](#56-shared-components)
   - [Styling Approach](#57-styling-approach)
   - [UI Component Library](#58-ui-component-library)
6. [Backend — Detailed Guide](#6-backend--detailed-guide)
   - [Server Bootstrap](#61-server-bootstrap)
   - [Middleware Stack](#62-middleware-stack)
   - [Authentication System (JSON File-Based)](#63-authentication-system-json-file-based)
   - [Session Management](#64-session-management)
   - [REST API Endpoints Reference](#65-rest-api-endpoints-reference)
   - [Approval Workflow Logic](#66-approval-workflow-logic)
   - [File Upload Handling](#67-file-upload-handling)
7. [Database — Detailed Guide](#7-database--detailed-guide)
   - [Database Technology](#71-database-technology)
   - [Prisma ORM Setup](#72-prisma-orm-setup)
   - [Schema — All Models Explained](#73-schema--all-models-explained)
   - [Model Relationships Diagram](#74-model-relationships-diagram)
   - [Database Migration](#75-database-migration)
8. [Dual Storage Strategy](#8-dual-storage-strategy)
9. [Data Flow — End-to-End Lifecycle](#9-data-flow--end-to-end-lifecycle)
10. [User Roles & Permissions](#10-user-roles--permissions)
11. [Environment Configuration](#11-environment-configuration)
12. [Installation & Setup](#12-installation--setup)
13. [Running the Application](#13-running-the-application)
14. [Available Scripts](#14-available-scripts)
15. [API Quick Reference](#15-api-quick-reference)
16. [Security Considerations](#16-security-considerations)
17. [Known Limitations & Future Improvements](#17-known-limitations--future-improvements)

---

## 1. Project Overview

VendorBridge is a procurement portal that digitises and automates the purchase process for organisations. The system mimics concepts found in enterprise ERP tools (like Odoo's Purchase module), offering:

- Vendor registry — centralised database of all suppliers with GST numbers, categories, and contact details.
- RFQ (Request for Quotation) — procurement officers/managers raise RFQs for required goods/services, attach supporting documents, and assign them to specific vendors.
- Quotation portal — vendors log in and submit pricing for the items listed in each RFQ assigned to them.
- Comparison & Approval — the system enables side-by-side quotation comparison; approvers can approve or reject with remarks. On approval, a Purchase Order and Invoice are auto-generated.
- PO & Invoice management — purchase orders and invoices are tracked through their lifecycle (Pending → Approved → Pending Payment → Paid/Rejected).
- Activity log — full audit trail of all login events.
- Reports — spending breakdown by category.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React 18 | Component-based SPA |
| Frontend build tool | Vite 5 | Dev server, HMR, production bundling |
| Frontend animation | Framer Motion | Page/element transitions |
| Frontend charts | Recharts | Spending trend charts on reports page |
| UI primitives | Radix UI (Avatar, Dropdown, Scroll Area, Separator, Slot) | Accessible headless UI components |
| Styling | Plain CSS (per-page files) + Tailwind utility classes | Custom design system |
| Icon library | Lucide React | SVG icon set |
| Backend runtime | Node.js (ESM modules) | Server runtime |
| Backend framework | Express.js 4 | REST API server |
| Backend ORM | Prisma 5 | Type-safe database access |
| Database | PostgreSQL | Persistent relational storage |
| File uploads | Multer 2 | Multipart form-data handling |
| Auth cookies | cookie-parser | HTTP-only session cookies |
| CORS | cors | Cross-origin request control |
| Dev concurrency | concurrently | Run Vite + Express together in one terminal |
| Env management | dotenv | Load `.env` into `process.env` |

---

## 3. Project Structure

```
OdooXKSV-main/
│
├── src/                         # React frontend source
│   ├── main.jsx                 # ReactDOM entry point
│   ├── App.jsx                  # Root component, routing, auth state
│   ├── style.css                # Global base styles
│   │
│   ├── pages/                   # One file per page/view
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── VendorPage.jsx
│   │   ├── RFQPage.jsx
│   │   ├── QuotationPage.jsx
│   │   ├── ApprovalPage.jsx
│   │   ├── POInvoicePage.jsx
│   │   ├── ReportPage.jsx
│   │   └── ActivityPage.jsx
│   │
│   ├── components/              # Reusable React components
│   │   ├── Sidebar.jsx          # Navigation sidebar (role-aware)
│   │   └── ui/                  # Low-level UI primitives
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── demo.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── full-screen-signup.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       ├── sidebar.tsx
│   │       └── skeleton.tsx
│   │
│   ├── styles/                  # Per-page CSS files
│   │   ├── login.css
│   │   ├── signup.css
│   │   ├── forgot.css
│   │   ├── dashboard.css
│   │   ├── sidebar.css
│   │   ├── vendor.css
│   │   ├── rfq-page.css
│   │   ├── rfq.css
│   │   ├── quotation-page.css
│   │   ├── approval.css
│   │   ├── po-invoice.css
│   │   ├── report.css
│   │   └── activity.css
│   │
│   └── lib/
│       └── utils.ts             # cn() Tailwind class merge utility
│
├── server.js                    # Express backend (all API routes)
├── check_db.js                  # Debug script: prints DB contents to console
│
├── prisma/
│   ├── schema.prisma            # Database schema (all models)
│   ├── migrations/
│   │   └── 20260606040019_init/
│   │       └── migration.sql   # Initial CREATE TABLE statements
│   └── migration_lock.toml
│
├── prisma.config.ts             # Prisma config (schema path, datasource)
│
├── data/                        # JSON flat-file storage (auth only)
│   ├── users.json               # Registered user accounts
│   ├── sessions.json            # Active login sessions
│   └── login-history.json       # Full audit log of login events
│
├── uploads/                     # Binary files uploaded via RFQ attachments
├── public/                      # Static assets served by Vite
│   └── vendorbridge-logo.svg
│
├── dist/                        # Production build output (from `npm run build`)
├── index.html                   # Vite HTML template
├── package.json
├── package-lock.json
├── .gitignore
└── .vscode/
    └── mcp.json                 # VS Code MCP tool config
```

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       Browser                           │
│   React SPA (Vite dev server :5173 / dist for prod)     │
│   State managed in App.jsx (useState / useEffect)       │
│   fetch() calls to backend API                          │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (REST JSON)
                           ▼
┌─────────────────────────────────────────────────────────┐
│               Express.js Backend (:4000)                │
│                                                         │
│  ┌───────────────┐   ┌──────────────────────────────┐  │
│  │  Auth Routes  │   │     Business Logic Routes     │  │
│  │  (JSON files) │   │  Vendors, RFQs, Quotations,   │  │
│  │               │   │  Approvals, POs, Invoices      │  │
│  └───────┬───────┘   └──────────────┬───────────────┘  │
│          │                          │                   │
│   data/*.json               PrismaClient                │
│   (users, sessions,                 │                   │
│    login-history)                   ▼                   │
└─────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │    PostgreSQL Database  │
                         │  (Vendor, RFQ, Quotation│
                         │  Approval, PO, Invoice, │
                         │  and related tables)    │
                         └────────────────────────┘
```

The backend uses two distinct persistence mechanisms:

- PostgreSQL via Prisma for all business data (vendors, RFQs, quotations, approvals, purchase orders, invoices).
- JSON flat files (`data/*.json`) for user accounts, sessions, and login history — keeping auth independent of the database connection status. If Prisma fails to connect, users can still log in; only business API routes become unavailable.

---

## 5. Frontend — Detailed Guide

### 5.1 Entry Point

`index.html` → `src/main.jsx`

```jsx
// src/main.jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`main.jsx` imports the global `style.css` and mounts `<App />` into the `#root` div.

---

### 5.2 App.jsx — Root Controller

`App.jsx` is the application shell. It manages:

| State variable | Type | Purpose |
|---|---|---|
| `page` | string | Which page/view is currently rendered |
| `user` | object/null | Logged-in user data (firstName, lastName, email, role) |
| `form` | object | Login form fields |
| `signup` | object | Registration form fields |
| `forgotEmail`, `forgotPhone` | string | Forgot password flow |
| `forgotStage` | `'verify'` \| `'reset'` | Two-step password reset state |
| `error` | string | Error message to display |
| `message` | string | Success message to display |

Session restoration on load: On mount, `useEffect` calls `GET /api/session`. If the server returns a valid user from the session cookie, the user is automatically logged in and redirected to their default page — no re-authentication required on refresh.

```jsx
useEffect(() => {
  fetch(`http://localhost:4000/session`, { credentials: 'include' })
    .then(r => r.json())
    .then(data => {
      if (data.user) {
        setUser(data.user);
        setPage(getDefaultPage(data.user.role));
      }
    });
}, []);
```

Page rendering: Rather than using a router library like React Router, the app uses conditional rendering. Each page is mounted when its `page` string matches:

```jsx
{page === 'dashboard' && user && <DashboardPage ... />}
{page === 'vendors'   && user && <VendorPage ...   />}
// etc.
```

---

### 5.3 Routing Strategy

VendorBridge does not use URL-based routing (React Router). Instead, a `page` state string controls which component renders. This is a state-machine navigation approach.

`switchPage(nextPage)` is the navigation function, passed down as `onNavigate` prop to every page and the Sidebar. When called, it resets error/message state and updates `page`.

The `getDefaultPage(role)` function determines where a user lands after login:

```js
const getDefaultPage = (role) => {
  if (role === 'Vendor')  return 'quotations';
  if (role === 'Officer') return 'approvals';
  return 'dashboard';            // Manager / Admin
};
```

---

### 5.4 Role-Based Navigation

The `Sidebar` component receives the `user` object and renders a different set of navigation items depending on `user.role`:

| Role | Navigation items shown |
|---|---|
| `Manager` | Dashboard, Vendors, RFQ's |
| `Officer` | Approvals, PO & Invoices, Reports, Activity |
| `Vendor` | Quotations only |
| `Admin` (fallback) | All items |

The `getRoute(item)` function maps display labels to `page` route strings. The `isActive(item)` function highlights the current page in the sidebar.

---

### 5.5 Pages

#### LoginPage (`src/pages/LoginPage.jsx`)
- Email + password form fields
- Calls `handleLogin()` in `App.jsx` which posts to `POST /api/login`
- Links to Signup and Forgot Password pages
- Shows inline `error` and `message` props

#### SignupPage (`src/pages/SignupPage.jsx`)
- Fields: First Name, Last Name, Email, Phone, Role (dropdown: Officer/Vendor/Manager/Admin), Country, Password, Confirm Password
- Posts to `POST /api/register`
- On success, redirects to login

#### ForgotPasswordPage (`src/pages/ForgotPasswordPage.jsx`)
- Two-stage form: Stage 1 verifies email + phone via `POST /api/forgot`. Stage 2 (after verification) resets password via `POST /api/reset-password`
- `forgotStage` state in `App.jsx` controls which form half renders

#### DashboardPage (`src/pages/DashboardPage.jsx`)
- Stats grid: 4 KPI cards (Active RFQs, Pending Approvals, POs this month, Overdue Invoices) — currently using static prop values from `App.jsx`
- Recent Purchase Orders table (static sample data)
- Spending Trends: a CSS-drawn bar chart showing 6 months + a category breakdown
- Quick Actions: shortcut buttons to New RFQ, Add Vendor, View Invoices

#### VendorPage (`src/pages/VendorPage.jsx`)
- Fetches all vendors from `GET /api/vendors` on mount
- Search bar (filters by company name, GST, category, contact) and status filter (All/Active/Inactive/Suspended)
- "Add Vendor" button opens a modal in `add` mode; clicking a vendor row opens it in `edit` mode
- Modal form submits to `POST /api/vendors` or `PUT /api/vendors/:id`
- Displays vendor cards with company name, category, status badge, GST, and contact details

#### RFQPage (`src/pages/RFQPage.jsx`)
- Fetches all RFQs and all vendors on mount
- "Create RFQ" form: title, category, deadline (date picker), description
- Dynamic line items: add/remove rows with item name, quantity, unit
- Vendor assignment: multi-select from fetched vendor list
- File attachments: up to 8 files via `<input type="file" multiple>`
- Submits as `multipart/form-data` to `POST /api/rfqs`
- Displays all existing RFQs in a list with line item count, assigned vendors, and attachment count

#### QuotationPage (`src/pages/QuotationPage.jsx`)
- **Vendor view**: only RFQs assigned to the logged-in vendor's email appear (filtered client-side)
- **Manager/Officer view**: all RFQs appear
- Selecting an RFQ auto-populates line items from the RFQ's `line_items` array
- Vendor fills in unit prices per item; totals are auto-calculated
- 18% GST applied automatically; grand total displayed
- Submit button posts to `POST /api/quotations`
- **Compare view**: switch tab to compare all quotations for a selected RFQ side-by-side (lowest price highlighted)

#### ApprovalPage (`src/pages/ApprovalPage.jsx`)
- Fetches quotations, RFQs, approvals, and invoices in parallel via `Promise.all`
- **Quotations tab**: lists RFQs that have quotations; selecting one shows a comparison table; approve/reject buttons with remarks textarea per quotation
- **Bills tab**: lists all invoices with Approve Bill / Reject Bill / Mark as Paid actions
- Summary stats bar: Total Quotations, Approved, Rejected, Pending counts
- Toast notifications (auto-dismiss after 3.5 s) on action success/failure

#### POInvoicePage (`src/pages/POInvoicePage.jsx`)
- Two tabs: **Purchase Orders** and **Invoices**
- Fetches both lists in parallel on mount
- PO list: shows PO number, vendor name, RFQ title, total amount, status, and invoice count
- Invoice list: shows invoice number, PO reference, subtotal, GST breakdown (CGST + SGST at 9% each), grand total, status
- Detail panel on row click: full line-item breakdown
- Action buttons: Approve Bill, Reject Bill, Mark as Paid (only shown when appropriate for current status)
- Summary stats: Total PO value, Total Invoice value, Pending invoices count

#### ReportPage (`src/pages/ReportPage.jsx`)
- Spending category breakdown using Recharts charts
- Visual reporting of procurement data

#### ActivityPage (`src/pages/ActivityPage.jsx`)
- Reads and displays the `login-history.json` audit log
- Shows email, role, status (success/failed), message, and timestamp for each event

---

### 5.6 Shared Components

#### Sidebar (`src/components/Sidebar.jsx`)
Props: `user`, `activePage`, `onNavigate`, `onLogout`

Structure:
- **Brand header**: VendorBridge logo SVG + name + tagline
- **User block**: User's initials in avatar circle, full name, role badge
- **Navigation**: Role-filtered nav items as `<button>` elements. Active item gets `.active` class and a dot indicator
- **Footer**: Logout button + copyright

#### UI Primitives (`src/components/ui/`)
These are Radix UI-based components wrapped with Tailwind's `class-variance-authority` for variant styling:

- `badge.tsx` — Status badge (variant: default, secondary, destructive, outline)
- `button.tsx` — Button with variants (default, destructive, outline, secondary, ghost, link) and sizes (default, sm, lg, icon)
- `dropdown-menu.tsx` — Full Radix dropdown with sub-menus, checkboxes, radio groups
- `scroll-area.tsx` — Custom scrollbar via Radix ScrollArea
- `separator.tsx` — Horizontal/vertical divider
- `skeleton.tsx` — Loading placeholder shimmer
- `sidebar.tsx` — Extended sidebar primitive (from shadcn/ui)

---

### 5.7 Styling Approach

The project uses **per-page CSS files** (no CSS modules, no Tailwind at the page level). Each page imports its own stylesheet:

```jsx
import '../styles/vendor.css';
```

Global base styles are in `src/style.css`.

CSS variables and custom properties are used for theming (e.g., stat card colours passed as inline `--stat-color` and `--stat-bg`). All CSS is plain CSS3 — flexbox, grid, custom properties, transitions, and keyframe animations.

The `cn()` utility in `src/lib/utils.ts` is a `clsx` + `tailwind-merge` helper used exclusively by the UI primitives for conditional class composition.

---

### 5.8 UI Component Library

The `src/components/ui/` folder contains components styled using:

- **Radix UI** — headless, accessible primitives
- **class-variance-authority (CVA)** — variant/size prop system
- **tailwind-merge** — resolves Tailwind class conflicts
- **clsx** — conditional class joining

These are used internally but not widely throughout the pages; most pages use plain HTML elements with custom CSS.

---

## 6. Backend — Detailed Guide

### 6.1 Server Bootstrap

`server.js` is a single-file Express server using **ESM `import`** syntax (`"type": "module"` in `package.json`).

On startup:
1. Imports all dependencies (express, cors, cookie-parser, multer, fs, path, crypto, PrismaClient)
2. Attempts `await prisma.$connect()` — sets `prismaConnected = true` on success; logs error and continues with `prismaConnected = false` if it fails
3. Calls `ensureDataFiles()` — creates `data/` and `uploads/` directories and initialises empty JSON files if they don't exist
4. Starts `app.listen(4000)` with EADDRINUSE error handling
5. Registers SIGINT/SIGTERM shutdown handlers for graceful Prisma disconnect

---

### 6.2 Middleware Stack

```js
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.options('*', cors(corsOptions));   // Preflight for all routes
app.use(express.json());               // Parse JSON request bodies
app.use(cookieParser());               // Parse Cookie header into req.cookies
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files
```

CORS is configured to allow only the Vite dev server origins, with `credentials: true` so cookies are included in cross-origin requests.

---

### 6.3 Authentication System (JSON File-Based)

Authentication deliberately uses JSON flat files rather than the PostgreSQL database so that login/logout still works even if the database is unavailable.

#### File paths

| File | Purpose |
|---|---|
| `data/users.json` | Array of user objects with all fields including password (plaintext — see [Security](#16-security-considerations)) |
| `data/sessions.json` | Array of `{ sessionId, email, role, createdAt }` |
| `data/login-history.json` | Append-only array of login attempt records |

#### Helper functions

`readJson(path, defaultValue)` — reads and JSON-parses a file; returns `defaultValue` on any error.

`writeJson(path, data)` — stringifies and writes data back to the file.

`validateEmail(email)` — simple regex check.

`findUserByEmail(email)` — reads `users.json`, finds user by case-insensitive email match.

`recordLoginAttempt({ email, status, role, message })` — prepends a new entry to `login-history.json`.

`createSession(userEmail)` — generates a `randomUUID()` session ID, reads the user's role, appends to `sessions.json`, returns the session ID.

---

### 6.4 Session Management

**Login** (`POST /api/login`):
1. Validates email format and password presence
2. Finds user in `users.json`
3. Compares passwords (plaintext comparison — see security note)
4. Creates session: generates UUID, writes to `sessions.json`
5. Sets cookie: `sessionId=<uuid>; HttpOnly; SameSite=Lax; MaxAge=30 days`
6. Records login attempt to history

**Session check** (`GET /api/session`):
1. Reads `sessionId` from cookie
2. Finds matching session in `sessions.json`
3. Fetches user from `users.json`
4. Returns user data (password field stripped)

**Logout** (`POST /api/logout`):
1. Reads `sessionId` cookie
2. Filters it out of `sessions.json`
3. Calls `res.clearCookie('sessionId')`

---

### 6.5 REST API Endpoints Reference

All business routes guard themselves with:
```js
if (!prismaConnected) return res.status(503).json({ error: '...' });
```

#### Auth Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/session` | Returns current logged-in user or `{ user: null }` |
| `POST` | `/api/login` | Authenticates user, sets session cookie |
| `POST` | `/api/register` | Creates new user account |
| `POST` | `/api/logout` | Destroys session, clears cookie |
| `POST` | `/api/forgot` | Verifies email + phone match (step 1 of reset) |
| `POST` | `/api/reset-password` | Updates password after verification (step 2) |

#### Vendor Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/vendors` | Fetches all vendors, ordered by creation date descending |
| `POST` | `/api/vendors` | Creates a new vendor. Required: `company_name`, `gst_number`, `category`, `status` |
| `PUT` | `/api/vendors/:id` | Updates vendor by ID. Same required fields as POST |

GST number has a unique database constraint; duplicate GST returns HTTP 400 with Prisma code `P2002`.

#### RFQ Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/rfqs` | All RFQs with nested `line_items`, `assigned_vendors` (with vendor detail), `attachments` |
| `POST` | `/api/rfqs` | Creates RFQ. Accepts `multipart/form-data` (up to 8 file attachments). Required: `title`, `category`, `deadline`, at least 1 valid `line_items` entry |

RFQ creation uses a Prisma nested create to atomically insert the RFQ record + all line items + vendor assignments + attachments in a single transaction.

#### Quotation Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/quotations` | All quotations with RFQ, vendor, and line items nested |
| `GET` | `/api/quotations/:id` | Single quotation with approvals included |
| `POST` | `/api/quotations` | Creates quotation with nested line items |
| `POST` | `/api/quotations/:id/approve` | **Approve workflow** — see section 6.6 |
| `POST` | `/api/quotations/:id/reject` | Rejects quotation, creates Approval record with status `Rejected` |

#### Approval Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/approvals` | All approvals (optional `?quotation_id=N` filter) |
| `GET` | `/api/approvals/:id` | Single approval with quotation |
| `POST` | `/api/approvals` | Manually creates an approval record |

#### Purchase Order & Invoice Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/purchase-orders` | All POs with items, quotation (with RFQ and vendor), and invoices nested |
| `GET` | `/api/invoices` | All invoices with nested PO (with items, quotation, RFQ, vendor) |
| `POST` | `/api/invoices/:id/approve` | Sets invoice status → `Pending Payment` |
| `POST` | `/api/invoices/:id/reject` | Sets invoice status → `Rejected` |
| `POST` | `/api/invoices/:id/pay` | Sets invoice status → `Paid` |

#### Quotation Item Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/quotation-items` | All items (optional `?quotation_id=N` filter) |
| `POST` | `/api/quotation-items` | Creates a quotation item |

---

### 6.6 Approval Workflow Logic

`POST /api/quotations/:id/approve` is the most complex endpoint. It orchestrates four database writes:

```
1. Fetch quotation (with items, RFQ, vendor)
2. Create Approval record   → approval_id: APR-<timestamp>, status: 'Approved'
3. Create PurchaseOrder     → po_number: PO-YYYY-NNNN (auto-incremented counter)
4. Create PurchaseOrderItems → copied from quotation.items
5. Create Invoice           → invoice_number: INV-YYYY-NNNN
                              subtotal: quotation.total_amount
                              cgst: subtotal × 9%
                              sgst: subtotal × 9%
                              tax_amount: cgst + sgst
                              grand_total: subtotal + tax_amount
                              status: 'Pending Approval'
6. Update Quotation.status  → 'Approved'
```

The PO number and Invoice number auto-increment by counting existing records:

```js
const poCount  = await prisma.purchaseOrder.count();
const poNumber = `PO-${year}-${String(poCount + 1).padStart(4, '0')}`;
```

Indian GST is split equally: **CGST 9% + SGST 9% = 18% total**.

---

### 6.7 File Upload Handling

Multer is configured with a destination directory:

```js
const upload = multer({ dest: uploadsDir }); // uploadsDir = ./uploads/
```

Multer stores files with a **hashed filename** (UUID-like, no extension) and makes original filename available as `file.originalname`. On RFQ creation, for each uploaded file an `RFQAttachment` record is created with:

- `file_name` — original filename
- `file_url` — `/uploads/<multer_hash>` (publicly accessible via Express static)
- `file_type` — MIME type
- `file_size` — bytes

The `uploads/` directory is served as static files by Express, so frontend can display/download attachments directly.

---

## 7. Database — Detailed Guide

### 7.1 Database Technology

**PostgreSQL** is the production database. Connection is provided via the `DATABASE_URL` environment variable in the standard PostgreSQL connection string format:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### 7.2 Prisma ORM Setup

Prisma is configured in `prisma/schema.prisma`. The generated client is output to `./generated/prisma/` (outside the default `node_modules` location, gitignored).

`prisma.config.ts` provides TypeScript config for schema path and datasource URL.

After any schema change, run:
```bash
npx prisma migrate dev --name <description>
```

After deploying to production:
```bash
npx prisma migrate deploy
```

To regenerate the Prisma client after schema changes:
```bash
npx prisma generate
```

### 7.3 Schema — All Models Explained

#### `User`
Minimal Prisma model (not actively used by the application — auth uses JSON files instead).

| Column | Type | Constraints |
|---|---|---|
| id | Int | PK, auto-increment |
| email | String | Unique |
| name | String? | Optional |

---

#### `Vendor`
Core supplier entity.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | Int | PK, auto-increment | |
| company_name | String | Required | |
| gst_number | String | Unique | Prevents duplicate registrations |
| category | String | Required | e.g. IT, Infrastructure, Logistics |
| status | String | Required | Active / Inactive / Suspended |
| contact_name | String? | Optional | |
| contact_email | String? | Optional | Used to link vendor logins to vendor records |
| contact_phone | String? | Optional | |
| created_at | DateTime | Default now() | |
| updated_at | DateTime | Auto-updated | |

Relations: Has many `RFQVendorAssignment`, has many `Quotation`.

---

#### `RFQ`
Request for Quotation document.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | Int | PK | |
| title | String | Required | Short name for the procurement |
| category | String | Required | |
| deadline | DateTime | Required | Last date vendors can submit quotes |
| description | String | Required | Free-text scope description |
| created_at | DateTime | | |
| updated_at | DateTime | | |

Relations: Has many `RFQLineItem`, `RFQVendorAssignment`, `RFQAttachment`, `Quotation`.

---

#### `RFQLineItem`
Individual item/service requested in an RFQ.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| rfq_id | Int | FK → RFQ |
| item | String | Item name/description |
| quantity | Int | Required quantity |
| unit | String | e.g. NOS (number of sets), KG, MTR, PCS |

---

#### `RFQVendorAssignment`
Junction table: which vendors are invited to quote on which RFQ.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| rfq_id | Int | FK → RFQ |
| vendor_id | Int | FK → Vendor |
| assigned_at | DateTime | Timestamp of assignment |

---

#### `RFQAttachment`
Files attached to an RFQ (specs, drawings, etc.).

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| rfq_id | Int | FK → RFQ |
| file_name | String | Original filename |
| file_url | String | Server path `/uploads/<hash>` |
| file_type | String? | MIME type |
| file_size | Int? | Bytes |
| uploaded_at | DateTime | |

---

#### `Quotation`
A vendor's price response to an RFQ.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| rfq_id | Int | FK → RFQ |
| vendor_id | Int | FK → Vendor |
| total_amount | Float | Sum of all line item totals |
| delivery_days | Int | Promised delivery time |
| status | String | Draft / Submitted / Approved / Rejected |
| created_at / updated_at | DateTime | |

Relations: Has many `QuotationItem`, `Approval`, `PurchaseOrder`.

---

#### `QuotationItem`
Individual priced line within a quotation.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| quotation_id | Int | FK → Quotation |
| description | String? | Item description |
| quantity | Int | Default 1 |
| unit | String | Default 'NOS' |
| unit_price | Float | Price per unit |
| total_price | Float | unit_price × quantity |

---

#### `Approval`
Audit record of an approve/reject decision on a quotation.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| approval_id | String | Unique. Format: `APR-<timestamp>` |
| quotation_id | Int | FK → Quotation |
| status | String | Approved / Rejected |
| remarks | String? | Optional comments from approver |
| created_at / updated_at | DateTime | |

---

#### `PurchaseOrder`
Auto-generated when a quotation is approved.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| po_number | String | Unique. Format: `PO-YYYY-NNNN` |
| po_date | DateTime | Default now() |
| quotation_id | Int | FK → Quotation |
| total_amount | Float | Copied from quotation |
| status | String | Default 'Pending' → 'Approved' on creation |
| notes | String? | Optional |

Relations: Has many `PurchaseOrderItem`, has many `Invoice`.

---

#### `PurchaseOrderItem`
Line items copied from the quotation into the PO.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| po_id | Int | FK → PurchaseOrder |
| description | String | |
| quantity | Int | |
| unit_price | Float | |
| total_price | Float | |

---

#### `Invoice`
Auto-generated alongside the PO when a quotation is approved. Represents the financial bill.

| Column | Type | Notes |
|---|---|---|
| id | Int | PK |
| invoice_number | String | Unique. Format: `INV-YYYY-NNNN` |
| invoice_date | DateTime | Default now() |
| due_date | DateTime? | Optional payment deadline |
| po_id | Int | FK → PurchaseOrder |
| subtotal | Float | Base amount (= PO total_amount) |
| cgst | Float | 9% of subtotal |
| sgst | Float | 9% of subtotal |
| tax_amount | Float | cgst + sgst (18% total) |
| grand_total | Float | subtotal + tax_amount |
| status | String | Pending Approval → Pending Payment → Paid / Rejected |
| notes | String? | |

---

### 7.4 Model Relationships Diagram

```
Vendor ─────────────────────────────────────────────────────┐
  │                                                          │
  ├── RFQVendorAssignment ──► RFQ ──► RFQLineItem           │
  │                              └──► RFQAttachment          │
  │                                                          │
  └── Quotation ◄─────────────────────────────────────────  ┤
        │                                                    │
        ├── QuotationItem                                    │
        ├── Approval                                         │
        └── PurchaseOrder ──► PurchaseOrderItem             │
              └── Invoice                                    │
```

---

### 7.5 Database Migration

The initial migration (`prisma/migrations/20260606040019_init/migration.sql`) only contains:

```sql
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

This means all other tables (Vendor, RFQ, Quotation, etc.) were created by subsequent migrations or directly via `prisma db push`. If setting up a fresh environment, run:

```bash
npx prisma migrate dev
```

or push the entire schema without migration history:

```bash
npx prisma db push
```

---

## 8. Dual Storage Strategy

| Data | Storage | Reason |
|---|---|---|
| User accounts | `data/users.json` | Auth stays functional even if DB is down |
| Login sessions | `data/sessions.json` | Lightweight, no DB dependency |
| Login audit log | `data/login-history.json` | Append-only log, no DB needed |
| Vendors | PostgreSQL | Relational data, needs to link to RFQs |
| RFQs | PostgreSQL | Complex nested data with files and line items |
| Quotations | PostgreSQL | Linked to RFQs and vendors |
| Approvals | PostgreSQL | Business record with audit trail |
| Purchase Orders | PostgreSQL | Financial document |
| Invoices | PostgreSQL | Financial document with GST calculation |
| Uploaded files | `uploads/` directory | Binary files served statically |

If `prismaConnected === false`, all `/api/vendors`, `/api/rfqs`, `/api/quotations`, `/api/approvals`, `/api/purchase-orders`, and `/api/invoices` routes return HTTP 503. Auth routes (`/api/login`, `/api/register`, `/api/session`, `/api/logout`) continue to work normally.

---

## 9. Data Flow — End-to-End Lifecycle

```
1. Manager registers vendors
   POST /api/vendors → Vendor table

2. Manager creates RFQ, assigns vendors, attaches files
   POST /api/rfqs (multipart) → RFQ + RFQLineItems + RFQVendorAssignments + RFQAttachments

3. Vendor logs in → sees only their assigned RFQs
   QuotationPage filters RFQs by assigned_vendors[].contact_email === user.email

4. Vendor submits quotation with unit prices
   POST /api/quotations → Quotation + QuotationItems

5. Officer/Manager reviews quotations per RFQ
   ApprovalPage fetches all quotations, groups by rfq_id, shows comparison table

6. Officer approves a quotation
   POST /api/quotations/:id/approve
   → Creates Approval (Approved)
   → Creates PurchaseOrder (PO-YYYY-NNNN)
   → Creates PurchaseOrderItems (copied from quotation)
   → Creates Invoice (INV-YYYY-NNNN, status: Pending Approval, with CGST+SGST)
   → Updates Quotation.status = Approved

7. Officer reviews Invoice in Bills tab
   → Approve Bill: Invoice.status = Pending Payment
   → Mark as Paid: Invoice.status = Paid

8. Finance/Officer tracks POs and Invoices on POInvoicePage
   GET /api/purchase-orders + GET /api/invoices
```

---

## 10. User Roles & Permissions

| Feature | Admin | Manager | Officer | Vendor |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ❌ | ❌ |
| Vendors (view & manage) | ✅ | ✅ | ❌ | ❌ |
| RFQs (create & view) | ✅ | ✅ | ❌ | ❌ |
| Quotations (submit & compare) | ✅ | ✅ | ❌ | ✅ (own only) |
| Approvals | ✅ | ❌ | ✅ | ❌ |
| PO & Invoices | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ❌ | ✅ | ❌ |
| Activity Log | ✅ | ❌ | ✅ | ❌ |

> Role enforcement is currently done only on the **frontend** via sidebar navigation filtering and page-level guards. The backend API routes do not currently validate the user's role — all authenticated users can call any API. This is a known limitation (see section 17).

---

## 11. Environment Configuration

Create a `.env` file in the project root (it is gitignored):

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/vendorbridge"
```

`DATABASE_URL` is the only required environment variable. It is consumed by both Prisma and the Express server via `dotenv`.

---

## 12. Installation & Setup

### Prerequisites

- **Node.js** 18 or higher (ESM support required)
- **npm** 9 or higher
- **PostgreSQL** 14 or higher running locally or remotely

### Steps

```bash
# 1. Clone / extract the project
cd OdooXKSV-main

# 2. Install all dependencies
npm install

# 3. Create your .env file
echo 'DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/vendorbridge"' > .env

# 4. Generate the Prisma client
npx prisma generate

# 5. Create the database and run migrations
npx prisma migrate dev --name init
#   OR if you just want to push schema without migration history:
npx prisma db push

# 6. (Optional) Verify DB connection and inspect data
node check_db.js
```

---

## 13. Running the Application

### Development (recommended)

Runs Vite dev server + Express backend concurrently in a single terminal:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173 (Vite with HMR)
- **Backend API**: http://localhost:4000

### Backend only

```bash
npm run server
# or
node server.js
```

### Production build

```bash
npm run build         # Vite builds to ./dist/
npm run preview       # Serves the dist build via Vite preview
node server.js        # Run the backend separately
```

In production, configure a reverse proxy (nginx/Caddy) to serve the `dist/` folder and proxy `/api/*` to the Express server on port 4000.

---

## 14. Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `concurrently "vite" "node server.js"` | Run both frontend and backend in dev mode |
| `build` | `vite build` | Build React app to `dist/` |
| `preview` | `vite preview` | Serve production build locally |
| `server` | `node server.js` | Run backend only |

Additional Prisma commands (not in package.json scripts but frequently needed):

```bash
npx prisma studio          # Open Prisma's GUI database browser
npx prisma migrate dev     # Create and apply a migration
npx prisma migrate deploy  # Apply migrations in production
npx prisma db push         # Push schema changes without migration history
npx prisma generate        # Re-generate Prisma Client
node check_db.js           # Print quotations, POs, and invoices to console
```

---

## 15. API Quick Reference

```
BASE URL: http://localhost:4000/api

Auth
  GET    /session
  POST   /login           { email, password }
  POST   /register        { firstName, lastName, email, phone, role, country, password, confirmPassword }
  POST   /logout
  POST   /forgot          { email, phone }
  POST   /reset-password  { email, phone, password, confirmPassword }

Vendors
  GET    /vendors
  POST   /vendors         { company_name, gst_number, category, status, contact_name?, contact_email?, contact_phone? }
  PUT    /vendors/:id     { same as POST }

RFQs
  GET    /rfqs
  POST   /rfqs            multipart/form-data: title, category, deadline, description, line_items(JSON), vendor_ids(JSON), attachments[]

Quotations
  GET    /quotations
  GET    /quotations/:id
  POST   /quotations      { rfq_id, vendor_id, total_amount, delivery_days, status, line_items[] }
  POST   /quotations/:id/approve  { remarks? }
  POST   /quotations/:id/reject   { remarks? }

Quotation Items
  GET    /quotation-items         ?quotation_id=N
  POST   /quotation-items         { quotation_id, unit_price, total_price, description? }

Approvals
  GET    /approvals               ?quotation_id=N
  GET    /approvals/:id
  POST   /approvals               { quotation_id, approval_id, status, remarks? }

Purchase Orders
  GET    /purchase-orders

Invoices
  GET    /invoices
  POST   /invoices/:id/approve
  POST   /invoices/:id/reject
  POST   /invoices/:id/pay
```

---

## 16. Security Considerations

The following are **current limitations** that must be addressed before any production deployment:

| Issue | Severity | Description |
|---|---|---|
| Plaintext passwords | Critical | Passwords are stored and compared in plain text in `users.json`. Must implement bcrypt hashing. |
| No backend role validation | High | All API routes are accessible to any authenticated user regardless of role. Role checks are frontend-only. |
| No server-side session validation per route | High | Business routes check `prismaConnected` but not whether the user is authenticated. |
| `HttpOnly` cookie but `secure: false` | Medium | `secure: false` means the cookie is sent over HTTP. In production, must set `secure: true` and serve over HTTPS. |
| No file type validation on uploads | Medium | Multer accepts all file types. Should whitelist allowed MIME types. |
| No file size limit | Medium | Multer has no `limits` configured. Large file uploads could exhaust disk space. |
| No rate limiting | Medium | Login and register endpoints have no rate limiting, making brute-force attacks possible. |
| CORS hardcoded to localhost | Low | Fine for development; must be updated to production domain before deploying. |
| No input sanitisation | Low | While Prisma parameterises queries (preventing SQL injection), HTML/XSS sanitisation is not applied to user inputs. |

---

## 17. Known Limitations & Future Improvements

- **Dashboard stats are static** — the 4 KPI cards and recent orders table on the Dashboard use hardcoded data from `App.jsx`. They should be replaced with real API aggregations.
- **No email notifications** — vendors are not emailed when an RFQ is assigned or a quotation is approved.
- **No pagination** — all lists (vendors, RFQs, quotations, etc.) load all records at once. Needs pagination or infinite scroll for large datasets.
- **No search/filter on backend** — filtering and searching is done client-side. Large datasets should move filtering to the API with query parameters.
- **Password stored in JSON** — move to a proper user table in PostgreSQL with bcrypt-hashed passwords.
- **Activity log reads JSON directly** — the Activity page should call a backend API route instead of reading the JSON file through the server.
- **No vendor portal isolation** — vendors can theoretically call any API endpoint; the backend should enforce that vendors can only access their own data.
- **No multi-level approval** — the current flow has a single approve/reject step. Enterprise procurement typically requires multi-step approval chains.
- **No email or OTP for password reset** — the forgot-password flow uses phone number matching as a substitute for proper OTP/email verification.
- **Report page is not connected to live data** — the reports use static/demo data from Recharts; should aggregate from the PostgreSQL database.

---

## Appendix — Sample Test Users (from data/users.json)

| Name | Email | Password | Role |
|---|---|---|---|
| Henit Panchal | henitpanchal007@gmail.com | 123456 | Admin |
| Henit Panchal | henit@gmail.com | h12345 | Manager |
| Hetvi | hetvi@gmail.com | h12345 | Officer |
| Heny Patel | heny@gmail.com | h12345 | Vendor |
| Mihir Patel | mihir@gmail.com | M@1231 | Officer |

> ⚠️ These are development test credentials. Never commit real credentials to version control.
