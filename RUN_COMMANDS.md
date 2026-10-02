# DIGI8 SOLUTIONS — HOW TO RUN THIS PROJECT

This guide provides the exact commands to run the **Digi8 Solutions** full-stack platform (Frontend + Backend API + Database + Invoicing & Project Financial Intelligence).

---

## ⚡ Quick Start (One Command)

You can launch both the **Frontend** and the **Backend** simultaneously from the project root.

### Method 1: Using npm (Recommended)
Open a terminal in the project directory (`digi-8-solutions-main`):

```bash
# 1. Install root frontend dependencies
npm install

# 2. Install backend server dependencies
cd server && npm install && cd ..

# 3. Start both Frontend & Backend concurrently
npm run dev
```

---

### Method 2: One-Click Windows Batch Script
You can simply double-click the included script or run it from CMD/PowerShell:

```cmd
run-all.bat
```
*(This automatically checks dependencies and opens both Vite Frontend and Node Backend in development mode).*

---

## 🖥️ Method 3: Running in Separate Terminals

If you prefer running the Frontend and Backend in separate terminal windows for dedicated log inspection:

### Terminal 1 — Backend API Server
```bash
cd server
npm install
npm run dev
```
- **Backend URL:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/api/health`
- **Database:** Automatic fallback to JSON database store (`server/data/digi8_database.json`) if MySQL is not running.

### Terminal 2 — Frontend Application (Vite + React)
```bash
# In the root project directory (digi-8-solutions-main)
npm install
npm run dev
```
- **Frontend URL:** `http://localhost:5173`

---

## 🌐 Application URLs

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Main Public Website** | [http://localhost:5173](http://localhost:5173) | Client portal, services, case studies, quote estimator |
| **Admin Super Portal** | [http://localhost:5173/admin](http://localhost:5173/admin) | Super Admin OTP login portal |
| **Staff Login Portal** | [http://localhost:5173/admin/staff](http://localhost:5173/admin/staff) | Password login for Sub Admin, HR, Sales, Developers |
| **Financial Dashboard** | [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard) | Revenue telemetry, day/month metrics, collections |
| **Invoice Management** | [http://localhost:5173/admin/invoices](http://localhost:5173/admin/invoices) | Create, edit drafts, GST calculation, issue, UPI QR |
| **Project Financials** | [http://localhost:5173/admin/projects](http://localhost:5173/admin/projects) | Project value, invoiced, paid, expenses, gross profit |
| **Backend API Gateway** | [http://localhost:3001/api](http://localhost:3001/api) | Express REST API server |

---

## 🔐 Default Login Credentials

### 1. Super Admin Login
- **URL:** [http://localhost:5173/admin](http://localhost:5173/admin)
- **Email:** `digi8solutions@gmail.com`
- **Auth Type:** One-Time Passcode (OTP). In development mode, the OTP is generated and displayed on screen/console or dispatched via SMTP.

### 2. Staff Accounts (Direct Login)
- **URL:** [http://localhost:5173/admin/staff](http://localhost:5173/admin/staff)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Sub Admin** | `subadmin@digi8solutions.com` | `SubAdmin@2026` |
| **HR Admin** | `hr@digi8solutions.com` | `HRPortal@2026` |
| **Developer** | `dev@digi8solutions.com` | `DevTeam@2026` |
| **Marketing Executive**| `marketing@digi8solutions.com` | `Marketing@2026` |
| **Database Admin** | `dbadmin@digi8solutions.com` | `DbAdmin@2026` |

---

## 📦 Production Build & Testing

To test the production build locally:

```bash
# 1. Typecheck TypeScript files
npm run typecheck

# 2. Build production assets
npm run build

# 3. Preview production build locally
npm run preview
```

---

## 🛠️ Useful Maintenance Commands

```bash
# Check if ports 5173 or 3001 are currently in use on Windows
netstat -ano | findstr :5173
netstat -ano | findstr :3001

# Kill process running on a specific port (replace <PID> with number from netstat)
taskkill /F /PID <PID>
```
