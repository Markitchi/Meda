# Meda - AI Medical Diagnostics Platform

## Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose

### 1. Start Infrastructure

```powershell
# Start Docker services (PostgreSQL, Redis, MinIO)
cd docker
docker-compose up -d
```

### 2. Start Backend

```powershell
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000
API docs: http://localhost:8000/docs

### 3. Start Frontend

```powershell
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3001

### 4. Access the Application

1. **Home**: http://localhost:3001
2. **Register**: http://localhost:3001/register
3. **Login**: http://localhost:3001/login
4. **Dashboard**: http://localhost:3001/dashboard

### Default Test Account

Create your account via the registration page. The system uses Argon2 for secure password hashing.

## Features

### Authentication
- User registration and login
- JWT token authentication
- Profile management
- Password change
- Dark/light theme toggle

### Image Management
- Upload medical images (DICOM, PNG, JPEG, TIFF)
- Image gallery with filters
- Search functionality
- Download and delete images

### Patient Management
- Create, read, update, delete patients
- Search patients by name or ID
- Patient detail pages
- Medical history tracking

### Modern UI
- Animated backgrounds
- Glassmorphism effects
- Gradient accents
- Smooth animations
- Responsive design
- No emojis (icons only)

## Troubleshooting

### Backend won't start
- Ensure Docker services are running: `docker-compose ps`
- Check virtual environment is activated
- Verify all dependencies installed: `pip list`

### Frontend won't start
- Delete `node_modules` and reinstall: `npm install`
- Clear Next.js cache: `rm -rf .next`

### Database connection issues
- Verify PostgreSQL is running: `docker ps`
- Check `.env` file configuration
- Test connection: http://localhost:8000/test-db

## Documentation

- **API Documentation**: http://localhost:8000/docs
- **UI Redesign**: `docs/UI_REDESIGN.md`
- **Progression**: `docs/PROGRESSION.md`

## Tech Stack

**Backend:**
- FastAPI + Python
- PostgreSQL + Redis + MinIO
- SQLAlchemy + Alembic
- JWT + Argon2

**Frontend:**
- Next.js 14 + TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn/UI

---

**Status**: Production Ready  
**Version**: 1.0.0  
**Last Updated**: December 15, 2025
