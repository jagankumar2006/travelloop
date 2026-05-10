<img width="1600" height="835" alt="WhatsApp Image 2026-05-10 at 4 07 18 PM" src="https://github.com/user-attachments/assets/8ec382d5-04fd-497a-b8a0-f0c98bc15d10" /># Traveloop – Personalized Travel Planning Made Easy ✈️

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
<img width="1600" height="835" alt="WhatsApp Image 2026-05-10 at 4 07 18 PM" src="https://github.com/user-attachments/assets/223ffc37-dc8b-4663-9df0-d4c5fe397d7b" />
<img width="1600" height="837" alt="WhatsApp Image 2026-05-10 at 4 07 21 PM" src="https://github.com/user-attachments/assets/4d802c2c-9f6a-452f-af6a-c76a56db0aee" />
<img width="1600" height="827" alt="WhatsApp Image 2026-05-10 at 4 07 24 PM" src="https://github.com/user-attachments/assets/a473e18e-7211-4ade-abcb-a582e550cd96" />
<img width="1600" height="839" alt="WhatsApp Image 2026-05-10 at 4 07 25 PM" src="https://github.com/user-attachments/assets/2fdd0369-1a25-4eb2-a2f8-6ee8d863ea4d" />
<img width="1600" height="818" alt="WhatsApp Image 2026-05-10 at 4 07 25 PM" src="https://github.com/user-attachments/assets/bb40a05e-69a9-42a2-b6ac-208edbf075fa" />





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
