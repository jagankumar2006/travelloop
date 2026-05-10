# Traveloop – Personalized Travel Planning Made Easy ✈️

> A full-stack, locally-hosted travel planning platform built with React, Express.js, and MySQL.

## 🌟 Features

- **Multi-City Itinerary Builder** – drag-and-drop stops, assign dates and activities
- **Interactive Timeline View** – Timeline / List / Calendar modes
- **Smart Budget Planner** – pie charts, bar charts, over-budget alerts, cost optimization
- **Activity Explorer** – filter by category, cost, and duration
- **City Search** – browse 20+ destinations with metadata
- **Packing Checklist** – categorized, animated, progress tracking
- **Trip Notes / Journal** – per-stop and per-trip notes with timestamps
- **Public Sharing** – shareable links with read-only itinerary view + PDF export
- **Admin Analytics Dashboard** – charts, user table, platform statistics
- **JWT Authentication** – secure login/signup with session persistence

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express.js |
| Database | MySQL (localhost only) |
| Auth | JWT + bcrypt |
| File Uploads | Multer (local filesystem) |
| PDF Export | jsPDF + html2canvas |
| Drag & Drop | @hello-pangea/dnd |

## 📁 Project Structure

```
traveloop/
├── frontend/          ← Vite + React app (port 5173)
├── backend/           ← Express.js API (port 5000)
├── database/
│   └── traveloop.sql  ← Full schema + seed data
├── README.md
└── setup-guide.md
```

## 🚀 Quick Start

See [setup-guide.md](./setup-guide.md) for full installation instructions.

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm

### 1. Database Setup
```bash
mysql -u root -p < database/traveloop.sql
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@traveloop.com | Admin@123 |

## 📸 Screenshots

*Add screenshots here after running the app.*

## 🐙 GitHub Push

```bash
git init
git add .
git commit -m "Initial Commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_LINK
git push -u origin main
```

## 📄 License

MIT License – built for hackathon submission.
