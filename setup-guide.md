# Traveloop Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or later → https://nodejs.org
- **MySQL** v8 or later → https://dev.mysql.com/downloads/mysql/
- **npm** (comes with Node.js)
- **Git** → https://git-scm.com

---

## Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
cd traveloop
```

---

## Step 2: Database Setup

### 2a. Open MySQL
```bash
mysql -u root -p
```

### 2b. Import the schema
```bash
mysql -u root -p < database/traveloop.sql
```

This will:
- Create the `traveloop` database
- Create all 11 tables with proper relationships
- Seed 20 cities, 35+ activities, and 1 admin user

### 2c. Verify
```sql
USE traveloop;
SHOW TABLES;
SELECT * FROM cities LIMIT 5;
```

---

## Step 3: Backend Setup

```bash
cd backend
npm install
```

### Configure `.env`
Edit `backend/.env` and set your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=traveloop
JWT_SECRET=traveloop_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
```

### Start the backend
```bash
npm run dev
```

You should see:
```
🚀 Traveloop API running at http://localhost:5000
✅ MySQL connected successfully
```

---

## Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 5: Open the App

Open your browser and navigate to:
```
http://localhost:5173
```

---

## Step 6: Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@traveloop.com | Admin@123 |

Or sign up for a new account.

---

## Troubleshooting

### MySQL connection error
- Ensure MySQL is running: `net start mysql` (Windows) or `sudo service mysql start` (Linux)
- Check your `.env` credentials match your MySQL setup

### Port conflicts
- Backend port 5000: change `PORT=5001` in `backend/.env`
- Frontend port 5173: change `server.port` in `frontend/vite.config.js`

### Uploads not showing
- The backend serves uploads at `http://localhost:5000/uploads/`
- The Vite proxy redirects `/uploads` to the backend automatically

---

## GitHub Submission

```bash
git init
git add .
git commit -m "Initial Commit - Traveloop Hackathon Submission"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_LINK
git push -u origin main
```

---

## File Upload Storage

All uploaded files are stored locally in:
```
backend/uploads/
  ├── profiles/   ← User profile photos
  ├── covers/     ← Trip cover images
  └── misc/       ← Activity images
```

Files are served at: `http://localhost:5000/uploads/<folder>/<filename>`
