# FreshVision AI
### AI-Powered Food Quality Inspection Platform

FreshVision AI is a production-grade local demonstration SaaS platform designed for modern food manufacturing plants, packaging centers, and agricultural quality assurance workflows. Operating 100% offline with zero cloud API dependencies, FreshVision AI combines deep computer vision models (YOLOv8 & OpenCV) with real-time analytics to inspect food produce, classify defects, estimate shelf life, and generate enterprise audit reports.

---

## 🌟 Key Features

- **100% Offline & Local Execution:** No cloud APIs, no API keys, no subscription costs. All ML models run locally on localhost.
- **Enterprise Dark Industrial UI/UX:** Inspired by Tesla, Palantir, and Apple. Features glassmorphic containers, smooth Framer Motion micro-interactions, and vibrant emerald/blue status highlights.
- **Intelligent AI Processing Pipeline:** A 12-stage automated vision pipeline featuring background removal, contrast enhancement (CLAHE), HSV color histogram browning analysis, GLCM texture variance, and bounding box defect localization.
- **Real-Time Analytics Dashboard:** Interactive KPI charts (Recharts) tracking acceptance ratios, defect frequency distributions, and batch inspection logs.
- **Enterprise PDF Audit Reports:** One-click generation of professional inspection certificates with embedded defect heatmaps, metrics, and verification QR codes.

---

## 🏗️ Clean Architecture & Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui base utilities
- **State Management:** Zustand + TanStack Query
- **Animations & Visualization:** Framer Motion + Recharts + Lucide Icons

### Backend
- **Framework:** Python 3.12 + FastAPI + Uvicorn
- **AI / Computer Vision:** PyTorch + Ultralytics YOLOv8 + OpenCV + NumPy + scikit-image
- **Persistence:** SQLAlchemy 2.0 ORM + SQLite (WAL Mode)
- **Reporting:** ReportLab (PDF) + Standard CSV Streams

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 20+ & npm
- Python 3.12+

### 1. Start Backend Server
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python database/seed.py
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173` to experience FreshVision AI!

---

## 📂 Project Structure
```text
ai_food/
├── frontend/             # React 19 + Vite SPA
├── backend/              # FastAPI + AI Vision Pipeline
├── docker-compose.yml    # Container deployment configuration
└── README.md
```

## 🔒 Security & Privacy
All processing occurs locally on your machine. Uploaded images and generated PDF certificates are stored locally within `backend/storage/`. No telemetry or user data leaves localhost.
