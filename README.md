# HamroClient 🏢🚀

![HamroClient Banner](https://via.placeholder.com/1200x300.png?text=HamroClient+-+Ultimate+Manpower+Agency+Management)

**HamroClient** is a state-of-the-art, multi-tenant SaaS platform tailored specifically for Manpower and Recruitment Agencies. Designed to handle everything from lead generation to final deployment, HamroClient serves as a centralized operating system for modern recruitment businesses operating across multiple branches and international corridors (Japan, UAE, EU, Australia, etc.).

---

## 🌟 Key Features

### 🏢 Multi-Tenant Agency Architecture
- **Global System Admin:** Master oversight to provision and monitor multiple independent Manpower Agencies on the platform.
- **Company Context Isolation:** Each agency enjoys strict data isolation. What happens in Agency A stays in Agency A.
- **Branch Management:** Agencies can operate seamlessly across multiple cities (e.g., Kathmandu HQ, Pokhara Branch) under one unified company umbrella.

### 🔐 Robust Role-Based Access Control (RBAC)
- **COMPANY_ADMIN:** Full oversight over their entire agency, branches, and staff.
- **BRANCH_MANAGER:** Isolated view restricted to the applicants, agents, and activities within their specific geographic branch.
- **AGENT:** Focused, restricted view managing solely the applicants they are personally assigned to.
- **Secure Provisioning:** Invite-only system using NextAuth JWE tokens with mandatory profile setup enforcement.

### 👥 Advanced Applicant Tracking System (ATS)
- **Comprehensive Profiles:** Track everything from Passport details and Medical/GAMCA clearances to Language Test scores (IELTS/JLPT).
- **Dynamic Application Pipelines:** Specialized tracking data for varying destination countries (e.g., COE for Japan, MOHRE for UAE).
- **Document Vault:** Secure, centralized storage for critical applicant documentation.

### 📊 Real-Time Analytics & Dashboard
- Live tracking of Company Health, Active Applications, Branch Performance, and System Audit Logs.

---

## 🛠 Tech Stack

HamroClient is built on a modern, deeply-integrated Next.js ecosystem.

**Frontend:**
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Tailwind CSS + Custom Premium UI System
- **State Management:** Redux Toolkit (RTK) & RTK Query
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React

**Backend & Infrastructure:**
- **Framework:** Next.js Route Handlers (REST APIs)
- **Database ORM:** Prisma
- **Database Engine:** PostgreSQL
- **Authentication:** NextAuth.js (JWT Strategy)
- **Storage:** S3 / Cloudinary (Document and Image Uploads)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Cloudinary or AWS S3 Bucket

### 1. Clone & Install
```bash
git clone https://github.com/Sandesh225/hamroclient.git
cd hamroclient

# Install Backend Dependencies
cd hamroclient_backend
npm install

# Install Frontend Dependencies
cd ../hamroclient_frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in both `hamroclient_backend` and `hamroclient_frontend`.

**Backend (`hamroclient_backend/.env`):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hamroclient"
NEXTAUTH_SECRET="your-super-strong-secret"
NEXTAUTH_URL="http://localhost:3001"
```

**Frontend (`hamroclient_frontend/.env`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-strong-secret" # Must match backend
```

### 3. Database Migration & Seeding
```bash
cd hamroclient_backend
npx prisma db push

# Run the seed script to populate System Admin and default branches
npx tsx prisma/seed.ts
```

### 4. Running the Development Servers
You will need two terminals running simultaneously.

```bash
# Terminal 1: Backend API (runs on 3001)
cd hamroclient_backend
npm run dev

# Terminal 2: Frontend Client (runs on 3000)
cd hamroclient_frontend
npm run dev
```

Visit `http://localhost:3000` and login with the seeded `admin@hamroclient.com` credentials.

---

## 🔒 Security Posture
- **CSRF Protection:** Integrated broadly via NextAuth.
- **Cross-Origin Handling:** Frontend proxy `/api/backend/*` intelligently masks backend ports and securely forwards encrypted `HttpOnly` session tokens.
- **Strict Typing:** End-to-end type safety using Prisma generated types and Zod schema validations.
- **SQL Injection Prevention:** Parametrized database queries inherently handled by Prisma.

---

## 📜 License
Proprietary Software. All rights reserved.
