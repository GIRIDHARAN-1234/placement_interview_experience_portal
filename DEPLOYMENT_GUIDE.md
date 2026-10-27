# 🚀 Real-Time Web Deployment Guide: Placement Interview Experience Portal

This guide provides a step-by-step walkthrough to deploy your MERN (MongoDB, Express, React, Node) placement portal live on the internet with a public URL that anyone can access in real time.

---

## 🌟 Recommended Architecture: All-in-One on Render (100% Free)

The easiest, most robust way to deploy this application is as a **Unified Web Service on Render**:
- **Why this is best**:
  - **Single Live URL** (e.g., `https://placement-portal-xyz.onrender.com`)
  - **Zero CORS issues** (The Express backend serves the production React build from `frontend/dist`)
  - **Automatic Database Seeding**: When the server starts up, it automatically initializes Tiger Analytics, Hexaware, Cognizant, Google, Microsoft, Amazon, and verified interview experiences.
  - **100% Free** with Render Free Tier + MongoDB Atlas Free Tier.

---

## Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

Because your local database (`mongodb://127.0.0.1:27017`) cannot be reached by public cloud servers, you need a free cloud database on **MongoDB Atlas**:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a Deployment** and choose the **M0 Free** cluster tier (AWS or Google Cloud, free forever).
3. **Set Database Username & Password**:
   - Example Username: `placement_admin`
   - Example Password: `MyStrongPassword123` *(save this!)*
4. **Network Access**:
   - Go to **Security** -> **Network Access** -> **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render servers can connect.
5. **Get Connection String**:
   - Click **Database** -> **Connect** -> **Drivers (Node.js)**.
   - Copy your connection string:
     ```
     mongodb+srv://placement_admin:MyStrongPassword123@cluster0.xxxx.mongodb.net/placement_portal?retryWrites=true&w=majority
     ```
   *(Replace `<password>` with your actual password and ensure `/placement_portal` is specified).*

---

## Step 2: Push Your Code to GitHub

Cloud hosts like Render, Railway, and Vercel deploy directly from your GitHub repository.

Open your terminal in the project root (`e:\PLACEMENT INTERVIEW EXPERIENCE PROJECT S7`) and run:

```bash
# 1. Initialize git
git init

# 2. Stage all files
git add .

# 3. Create your first commit
git commit -m "feat: complete placement portal with Tiger Analytics, Hexaware, Cognizant and cloud deployment setup"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

*(If you haven't created a GitHub repository yet, visit [github.com/new](https://github.com/new), create a new repository named `placement-portal`, and run the commands above).*

---

## Step 3: Deploy to Render in 3 Minutes

1. Sign up or log in at [Render.com](https://render.com).
2. Click the blue **New +** button in the dashboard and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub account.
4. Select your `placement-portal` repository.
5. Configure the deployment settings:
   - **Name**: `placement-interview-portal` (or any custom name)
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, or Oregon)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repository root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan Type**: `Free`

6. Scroll down to **Environment Variables** and click **Add Environment Variable** for each:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production static file serving & caching |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 1 |
| `JWT_SECRET` | `super_secret_placement_portal_production_2026` | Any secure random string |
| `JWT_EXPIRE` | `7d` | Token expiry duration |
| `COOKIE_SECURE` | `true` | Secure cookies over HTTPS |
| `ADMIN_EMAIL` | `admin@college.edu` | Placement admin login email |
| `ADMIN_PASSWORD` | `AdminPass@2026` | Placement admin login password |
| `ADMIN_NAME` | `Placement Cell Administrator` | Display name for admin |

7. Click **Create Web Service**!

Render will automatically run `npm run build`, build the Vite frontend, install backend packages, and launch `server.js`. Within 2–3 minutes, you will receive your live URL:
👉 **`https://placement-interview-portal.onrender.com`**

---

## Step 4: Populate Full Demo Data on the Live Site

The server automatically runs `ensureDefaultData()` on boot, meaning **Tiger Analytics**, **Hexaware**, **Cognizant**, and their verified experiences are ready immediately.

To also populate all demo student accounts and 30+ curated questions:
1. In your Render Dashboard, open your Web Service.
2. Click the **Shell** tab on the left menu.
3. Run:
   ```bash
   npm run seed
   ```
4. All sample data (6 student accounts, 9 companies, 9 drives, offers, questions, and resources) will be seeded into your MongoDB Atlas cloud database!

### Default Login Credentials on Live Site:
- **Admin**: `admin@college.edu` / `AdminPass@2026`
- **Placed Student 1 (Google & TCS)**: `student1@college.edu` / `StudentPass@2026`
- **Placed Student 2 (Microsoft)**: `student2@college.edu` / `StudentPass@2026`
- **Placed Student 3 (Amazon & Hexaware)**: `student3@college.edu` / `StudentPass@2026`
- **Student 4 (Not Placed / Preparing)**: `student4@college.edu` / `StudentPass@2026`
- **Placed Student 5 (Tiger Analytics)**: `student5@college.edu` / `StudentPass@2026`
- **Placed Student 6 (Cognizant GenC Next)**: `student6@college.edu` / `StudentPass@2026`

---

## 🔄 Alternative Method: Split Deployment (Frontend on Vercel + Backend on Render)

If you prefer to host your frontend on **Vercel** and your backend on **Render**:

1. **Deploy Backend on Render**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=https://your-frontend.vercel.app`
   - Copy backend live URL: `https://your-backend.onrender.com`

2. **Deploy Frontend on Vercel**:
   - Go to [vercel.com](https://vercel.com) -> **Add New Project**.
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable:
     - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
   - Click **Deploy**.
