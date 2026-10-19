# DIGI8 SOLUTIONS — LIVE ACCESS & CREDENTIALS GUIDE

## 1. Super Admin Authentication (Password & OTP)

The `/admin` gateway provides direct **Password Login** and database-backed **OTP Verification** for the Super Administrator.

| Parameter | Value |
| :--- | :--- |
| **Login Portal** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **Super Admin ID / Email** | `digi8solutions@gmail.com` |
| **Super Admin Password** | `Digi8Solutions@0987` |
| **Alternative Verification** | 6-Digit Passcode dispatched to `digi8solutions@gmail.com` via Gmail SMTP |
| **Session Role** | Super Administrator (Full Executive Authority across all modules) |

### How to Sign In:
1. Open [http://localhost:5173/admin](http://localhost:5173/admin).
2. Enter your credentials:
   - **Email:** `digi8solutions@gmail.com`
   - **Password:** `Digi8Solutions@0987`
3. Click **"Sign In to Admin Panel"**.
4. You are immediately granted access to the Executive Dashboard.
*(Alternatively, switch to the "OTP Verification" tab to receive a 6-digit passcode via email).*

---

## 2. Staff Authentication & Zero-Verification Provisioning

The Super Administrator can directly create and provision staff logins from **[User Management](http://localhost:5173/admin/users)** with **zero email verification or OTP required**. Once created, the account is immediately active.

### Staff Login Portal:
- **URL:** [http://localhost:5173/admin/staff](http://localhost:5173/admin/staff)
- **Mechanism:** Direct Email / Username + Password Authentication (No OTP or confirmation link needed).

### Pre-Configured Staff Accounts:
| Role | Email | Password | Accessible Portals |
| :--- | :--- | :--- | :--- |
| **Sub Admin** | `subadmin@digi8solutions.com` | `SubAdmin@2026` | Operations, Careers/ATS, Leads, Quotes, Projects, Contacts, Blog, Pricing, Analytics |
| **HR Admin** | `hr@digi8solutions.com` | `HRPortal@2026` | Careers Overview, ATS Pipeline, Candidate CRM, Interviews, Email Automations, Funnel Analytics |
| **Developer** | `dev@digi8solutions.com` | `DevTeam@2026` | Support Tickets, Projects & Portfolio, Developer Settings |
| **Marketing Executive** | `marketing@digi8solutions.com` | `Marketing@2026` | Leads Center, Quotes Estimator, Contact Inquiries, Testimonials, Blog Editor |
| **Database Admin** | `dbadmin@digi8solutions.com` | `DbAdmin@2026` | Dashboard, System Telemetry & Database Diagnostics |

### How Admin Provisions Logins:
1. Go to **Admin Dashboard → User Management** (`/admin/users`).
2. Click **"Create Staff Login"**.
3. Enter Name, Email/Username, select Role, and enter (or generate) a Password.
4. Click **"Create & Activate Login Now"**.
5. The account is immediately created and active. Click **"Copy Credentials"** to give them directly to the employee.
6. The employee logs in at `/admin/staff` and accesses only their permitted role sections!

---

## 2. Platform Portals & Navigation URLs

### Administrative Portals
- **Admin Login:** [http://localhost:5173/admin](http://localhost:5173/admin)
- **Executive Dashboard:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)
- **ATS Kanban Pipeline:** [http://localhost:5173/admin/careers/pipeline](http://localhost:5173/admin/careers/pipeline) *(Drag-and-drop applicant board)*
- **Candidate CRM:** [http://localhost:5173/admin/careers/candidates](http://localhost:5173/admin/careers/candidates) *(Unified talent database grouped by email)*
- **Interview Center & Scorecards:** [http://localhost:5173/admin/careers/interviews](http://localhost:5173/admin/careers/interviews) *(Video meetings & 1–5 star evaluations)*
- **Email Automation & Templates:** [http://localhost:5173/admin/careers/automations](http://localhost:5173/admin/careers/automations) *(Event triggers & template compiler)*
- **Recruitment Funnel & Telemetry:** [http://localhost:5173/admin/careers/analytics](http://localhost:5173/admin/careers/analytics) *(Conversion rates, drop-off & CSV export)*
- **Job Postings Manager:** [http://localhost:5173/admin/careers](http://localhost:5173/admin/careers)
- **Create New Job Opening:** [http://localhost:5173/admin/careers/jobs/new](http://localhost:5173/admin/careers/jobs/new)

### Public-Facing Candidate Portals
- **Careers Platform Landing:** [http://localhost:5173/career](http://localhost:5173/career)
- **Self-Service Application Tracker:** [http://localhost:5173/career/status](http://localhost:5173/career/status) *(Check milestone status via Application ID & Email)*
- **Company Website Homepage:** [http://localhost:5173/](http://localhost:5173/)

### Backend REST API & Realtime Services
- **Backend API Base:** [http://localhost:3001/api](http://localhost:3001/api)
- **Health Check:** [http://localhost:3001/health](http://localhost:3001/health)
- **Realtime SSE Event Stream:** [http://localhost:3001/api/admin/events](http://localhost:3001/api/admin/events)

---

## 3. Keyboard Shortcuts & Pro-Tips

- **Global ATS Command Palette:** Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>Cmd</kbd> + <kbd>K</kbd>) anywhere inside the Admin portal to search applicants, navigate between ATS views, or post new opportunities.
- **Candidate Workspace Modal:** Click any candidate card or row in the **ATS Pipeline** or **Candidate CRM** to open the 6-tab inspection workspace (Profile & Resume, Timeline, Notes, Interviews, Email Composer, and Tasks).
- **Zero-Leak Candidate Privacy:** The `/career/status` endpoint and tracker only expose candidate-facing roadmap stages. Internal recruiter notes, scorecards, and internal rejection reasons are strictly isolated from candidate view.

---

## 4. How to Start the Services

To run both the Vite frontend and the Express backend simultaneously, run:
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Backend Server (Port 3001)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
npm run dev
```
