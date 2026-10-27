# Placement Interview Experience & Preparation Portal (Semester 7 Capstone Project)

An enterprise-grade, full-stack **MERN** (MongoDB, Express, React, Node.js) web application designed for engineering colleges and universities. The platform enables final-year students and placement coordinators to archive authenticated interview experiences, verify placement offers, practice company-specific technical questions, and track placement readiness metrics.

---

## 🌟 Key Features & Architectural Highlights

### 1. Mandatory Placement Offer Verification Engine
- **Anti-Fraud & Authenticity Enforcement**: Only students who have a verified, administrator-confirmed **SELECTED** placement offer for a specific company and drive can submit an interview experience for that company.
- Non-placed students or students with offers from other companies are strictly blocked with `HTTP 403 Forbidden` and guided with clear in-app explanations.

### 2. Administrator Moderation Workflow
- All submitted interview experiences enter a **Pending Moderation** review queue.
- Administrators review round details, questions asked, and preparation advice before approving or rejecting with feedback.
- Experiences only appear on public company pages and general feeds once officially approved.

### 3. Smart Practice & Company Preparation Roadmaps
- Curated Question Bank with category filters (Data Structures & Algorithms, System Design, Operating Systems, DBMS, Computer Networks, HR & Behavioral).
- Step-by-step company-specific preparation roadmaps with difficulty ratings and question lists.
- Interactive **Smart Practice** mode with timed sessions and progress tracking.

### 4. Measurable Placement Readiness Score
- Proprietary algorithmic readiness score (0–100%) calculated from:
  - Technical questions solved across core categories
  - Study resources explored
  - Milestone study tasks completed
- Interactive charts powered by **Recharts** displaying topic mastery and college-wide placement trends.

### 5. Administrative Directorate Console
- **Student Management**: Filter students by department and graduation year; toggle active/inactive account status.
- **Company Management**: Manage recruiter profiles, hiring patterns, and criteria.
- **Drive Management**: Schedule upcoming campus placement drives and packages (CTC).
- **Offer Management**: Issue individual offers, perform bulk JSON import of drive selection lists, and manage statuses (`selected`, `waitlisted`, `rejected`).
- **Audit Logs**: Compliance audit log tracking all administrative interventions.

---

## 🏗️ Project Architecture & Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Recharts, Lucide Icons, React Hot Toast, Axios |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB ODM), Helmet, Morgan, Cookie-Parser, CORS |
| **Authentication & Security** | JWT (JSON Web Tokens), HTTP-Only Cookies, BCrypt password hashing, Express-Validator |
| **Testing** | Jest, Supertest (17/17 Integration Tests Passing) |
| **Database** | MongoDB |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on `mongodb://127.0.0.1:27017` or configured via `.env`)

---

### Step 1: Backend Setup & Database Seeding

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Populate the database with complete sample data (Companies, Drives, Offers, Experiences, Questions, Users):
   ```bash
   npm run seed
   ```
4. Start the backend server in development mode:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000 (API at http://localhost:5000/api)
   ```

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   # App runs at http://localhost:5173
   ```
4. Build for production (optional):
   ```bash
   npm run build
   ```

---

### Step 3: Run Automated Test Suite

To run the automated backend integration test suite:
```bash
cd backend
npm test
```
*Executes all 17 integration tests covering authentication, offer verification, moderation flow, readiness calculation, and question banks.*

---

## 🔑 Demo Login Credentials

The database seed script initializes the following pre-configured demonstration accounts:

### Administrator Account
- **Email:** `admin@college.edu`
- **Password:** `AdminPass@2026`
- **Role:** Administrator (Access to Admin Dashboard, Offer Management, Drive Setup, Moderation Queue, Student Directory, Audit Logs)

### Student Accounts
| Account | Email | Password | Status / Placement Offer |
|---|---|---|---|
| **Student 1** (Placed) | `student1@college.edu` | `StudentPass@2026` | Verified offers for **Google** & **TCS** (Eligible to submit experiences for both) |
| **Student 2** (Placed) | `student2@college.edu` | `StudentPass@2026` | Verified offer for **Microsoft** |
| **Student 3** (Placed) | `student3@college.edu` | `StudentPass@2026` | Verified offer for **Amazon** |
| **Student 4** (Preparing) | `student4@college.edu` | `StudentPass@2026` | In-progress / Non-placed (Demonstrates verification rejection guard) |

---

## 📁 Directory Structure

```
PLACEMENT INTERVIEW EXPERIENCE PROJECT S7/
├── backend/
│   ├── config/              # MongoDB connection configuration
│   ├── controllers/         # Business logic for Auth, Companies, Drives, Experiences, Offers, etc.
│   ├── middleware/          # JWT protection, role-based authorization, validator & error handlers
│   ├── models/              # Mongoose schemas (User, Company, Offer, Experience, Question, etc.)
│   ├── routes/              # Express REST API route definitions
│   ├── scripts/             # Database seed (`seed.js`) & Admin bootstrapping scripts
│   ├── tests/               # Jest & Supertest integration test suite (`api.test.js`)
│   ├── validators/          # Input schema validations using express-validator
│   ├── app.js               # Express application initialization & middleware stack
│   ├── server.js            # HTTP server startup & graceful shutdown
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Modal, Navbar, Sidebar, Badge, etc.)
│   │   ├── context/         # AuthContext with session persistence and role routing
│   │   ├── layouts/         # PublicLayout and DashboardLayout with sidebar navigation
│   │   ├── pages/
│   │   │   ├── admin/       # Admin Dashboard, Student/Offer/Drive/Company/Moderation pages
│   │   │   ├── auth/        # Login, Register, Profile pages
│   │   │   ├── public/      # Home, Company Directory & Details, Question Bank, Experience Archive
│   │   │   └── student/     # Student Dashboard, Submit Experience, Roadmap, Smart Practice, Tasks, Analytics
│   │   ├── routes/          # Role-based protected router configuration (`AppRoutes.jsx`)
│   │   ├── services/        # Axios API client with cookie handling
│   │   ├── App.jsx          # Root application component
│   │   └── main.jsx         # Entry point
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```
