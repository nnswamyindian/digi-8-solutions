# DIGI8 SOLUTIONS — LIVE ACCESS & CREDENTIALS GUIDE

## 1. Super Admin Authentication (Database-Verified OTP)

The `/admin` gateway is exclusively secured by **One-Time Passcode (OTP)** authentication for the Super Administrator. All passwords and alternative logins have been removed for maximum security.

| Parameter | Value |
| :--- | :--- |
| **Login Portal** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **Super Admin Email** | `digi8solutions@gmail.com` |
| **Security Mechanism** | 6-Digit Passcode dispatched directly to `digi8solutions@gmail.com` via Gmail SMTP |
| **Database Verification** | Verified against `admin_otps` & `admin_users` tables in the database |
| **Session Role** | Super Administrator (Full Executive Authority) |
| **Passcode Validity** | 10 Minutes per OTP request |

### How to Sign In:
1. Open [http://localhost:5173/admin](http://localhost:5173/admin).
2. The authorized Super Admin email (`digi8solutions@gmail.com`) is displayed.
3. Click **"Send OTP to digi8solutions@gmail.com"**.
4. Check your Gmail inbox for the 6-digit security code (or use the auto-detected code hint in local dev mode).
5. Enter the 6-digit passcode and click **"Verify OTP & Access Admin Panel"**.
6. You are immediately verified against the database and granted Super Admin dashboard access.

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
