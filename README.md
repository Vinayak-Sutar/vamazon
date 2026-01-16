# Vamazon - Amazon Clone E-commerce Platform

A full-stack e-commerce application built with Next.js and FastAPI, featuring Amazon-like UI and functionality.

## 🚀 Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS**
- **React Context** for state management

### Backend

- **FastAPI** (Python)
- **SQLAlchemy** ORM
- **PostgreSQL** database
- **JWT** authentication

## ✨ Features

### Core Features

- ✅ Product listing with search and category filters
- ✅ Product detail page with image carousel
- ✅ Shopping cart (guest + authenticated)
- ✅ Checkout with shipping address
- ✅ Order confirmation with order number

### Bonus Features

- ✅ User authentication (Register/Login)
- ✅ Order history
- ✅ Wishlist functionality
- ✅ Email notifications on order placement
- ✅ Responsive design (mobile, tablet, desktop)

## 🛠️ Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
# Navigate to project root
cd scaler

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
cd backend
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run the server
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Frontend runs at: http://localhost:3000

### Seed Database

```bash
cd backend
python seed.py
```

## 🌐 Deployment on Render

### Option 1: Blueprint (Recommended)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create all services

### Option 2: Manual Setup

#### 1. Create PostgreSQL Database

- New → PostgreSQL
- Name: `vamazon-db`
- Region: Singapore (or nearest)
- Plan: Free

#### 2. Deploy Backend

- New → Web Service
- Connect GitHub repo
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
| Key | Value |
|-----|-------|
| `DATABASE_URL` | (Copy from PostgreSQL service) |
| `SECRET_KEY` | (Generate random string) |
| `SMTP_EMAIL` | your-email@gmail.com |
| `SMTP_PASSWORD` | your-app-password |
| `FRONTEND_URL` | https://your-frontend.onrender.com |

#### 3. Deploy Frontend

- New → Web Service
- Connect GitHub repo
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | https://your-backend.onrender.com |

#### 4. Seed Production Database

After deployment, use Render Shell:

```bash
cd backend
python seed.py
```

## 📁 Project Structure

```
scaler/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app
│   │   ├── database.py       # DB connection
│   │   ├── auth.py           # JWT auth
│   │   ├── email_service.py  # Email notifications
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routes/           # API endpoints
│   │   └── schemas/          # Pydantic schemas
│   ├── requirements.txt
│   └── seed.py
├── frontend/
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   ├── context/              # State management
│   ├── lib/                  # API utilities
│   └── types/                # TypeScript types
└── render.yaml               # Render blueprint
```

## 🔐 Test Account

Email: `test@a.com`
Password: `123456`

## 📧 Email Configuration

Uses Gmail SMTP. To set up:

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Google Account → Security → App Passwords
3. Use the 16-character password in `SMTP_PASSWORD`

## 📝 License

This project was created for educational purposes as part of the Scaler SDE Intern assignment.
