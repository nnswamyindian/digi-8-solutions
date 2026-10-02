Viewed package.json:1-37
Listed directory digi-8-solutions-main
Viewed .env:1-21
Viewed .env:1-23
Viewed CREDENTIALS.md:1-60
Created RUN_COMMANDS.md
Created run-all.bat
Created run-all.ps1

The commands to run this project have been saved to [RUN_COMMANDS.md](file:///c:/Users/nnswa/OneDrive/Desktop/ROYAL_PROJECTS/digi-8-solutions-main/RUN_COMMANDS.md). Additionally, two one-click launcher scripts ([run-all.bat](file:///c:/Users/nnswa/OneDrive/Desktop/ROYAL_PROJECTS/digi-8-solutions-main/run-all.bat) and [run-all.ps1](file:///c:/Users/nnswa/OneDrive/Desktop/ROYAL_PROJECTS/digi-8-solutions-main/run-all.ps1)) have been created in the project root.

---

### Quick Commands Summary

#### Option 1: One Command (Full Stack Concurrently)
Open your terminal in `digi-8-solutions-main`:

```bash
# 1. Install frontend & backend dependencies
npm install
cd server && npm install && cd ..

# 2. Start both Frontend & Backend
npm run dev
```

---

#### Option 2: One-Click Windows Script
Double-click [run-all.bat](file:///c:/Users/nnswa/OneDrive/Desktop/ROYAL_PROJECTS/digi-8-solutions-main/run-all.bat) or run from PowerShell:

```powershell
.\run-all.ps1
```

---

#### Option 3: Running in Separate Terminals

**Terminal 1 — Backend API Server (`http://localhost:3001`):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — Frontend Application (`http://localhost:5173`):**
```bash
# In the root project folder
npm install
npm run dev
```

---

### Access Portals & Links

- **Main Website:** [http://localhost:5173](http://localhost:5173)
- **Super Admin Portal (OTP):** [http://localhost:5173/admin](http://localhost:5173/admin) *(Email: `digi8solutions@gmail.com`)*
- **Staff Login Portal:** [http://localhost:5173/admin/staff](http://localhost:5173/admin/staff) *(E.g. `subadmin@digi8solutions.com` / `SubAdmin@2026`)*
- **Invoice Management:** [http://localhost:5173/admin/invoices](http://localhost:5173/admin/invoices)
- **Project Financials:** [http://localhost:5173/admin/projects](http://localhost:5173/admin/projects)
- **Executive Financial Dashboard:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)
- **Backend API Gateway:** [http://localhost:3001/api](http://localhost:3001/api)