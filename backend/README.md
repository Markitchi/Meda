# 🔧 Meda Backend

FastAPI backend for the Meda medical diagnostics platform.

## 📋 Overview

The backend is built with **FastAPI** and provides a RESTful API for:
- User authentication with JWT and 2FA
- Patient management
- Medical image storage and retrieval
- AI-powered diagnosis generation
- Consultation management
- PDF report generation
- Real-time notifications
- Collaboration features

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- pip and virtualenv

### Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   copy ..\.env.example ..\.env
   # Edit .env with your configuration
   ```

5. **Create database tables**:
   ```bash
   python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

6. **Start the server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                    # API endpoints
│   │   └── v1/                # API version 1
│   │       ├── auth.py        # Authentication
│   │       ├── images.py      # Image management
│   │       ├── patients.py    # Patient CRUD
│   │       ├── profile.py     # User profile
│   │       └── endpoints/     # Additional endpoints
│   │           ├── analysis.py      # AI analysis
│   │           ├── consultations.py # Consultations
│   │           ├── diagnosis.py     # Diagnosis generation
│   │           ├── reports.py       # PDF reports
│   │           ├── notifications.py # Notifications
│   │           └── collaboration.py # Sharing & comments
│   │
│   ├── core/                  # Core configuration
│   │   ├── config.py         # App settings
│   │   ├── database.py       # Database connection
│   │   └── security.py       # Security utilities
│   │
│   ├── models/               # SQLAlchemy models
│   │   ├── user.py          # User model
│   │   ├── medical.py       # MedicalImage, Patient
│   │   ├── consultation.py  # Consultation, MedicalHistory
│   │   ├── analysis.py      # Analysis model
│   │   └── notification.py  # Notification model
│   │
│   ├── services/            # Business logic
│   │   ├── notification_service.py
│   │   ├── diagnosis_service.py
│   │   ├── report_service.py
│   │   └── collaboration_service.py
│   │
│   └── main.py             # FastAPI application entry point
│
├── requirements.txt        # Python dependencies
├── Dockerfile.prod        # Production Docker configuration
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with 2FA
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Patients
- `GET /api/v1/patients` - List all patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/{id}` - Get patient details
- `PUT /api/v1/patients/{id}` - Update patient
- `DELETE /api/v1/patients/{id}` - Delete patient

### Medical Images
- `POST /api/v1/images/upload` - Upload image
- `GET /api/v1/images` - List images
- `GET /api/v1/images/{id}` - Get image
- `DELETE /api/v1/images/{id}` - Delete image

### Consultations
- `POST /api/v1/consultations` - Create consultation
- `GET /api/v1/consultations` - List consultations
- `GET /api/v1/consultations/{id}` - Get consultation

### AI Diagnosis
- `POST /api/v1/diagnosis/generate` - Generate AI diagnosis

### Reports
- `GET /api/v1/reports/consultation/{id}` - Generate consultation PDF
- `GET /api/v1/reports/patient/{id}` - Generate patient PDF

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PATCH /api/v1/notifications/{id}/read` - Mark as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

### Collaboration
- `POST /api/v1/collaboration/share` - Share consultation
- `GET /api/v1/collaboration/shared-with-me` - Get shared consultations
- `POST /api/v1/collaboration/consultations/{id}/comments` - Add comment
- `GET /api/v1/collaboration/consultations/{id}/comments` - Get comments

**[Complete API Reference →](../docs/API_REFERENCE.md)**

## 🗄️ Database Models

### User
- Authentication and profile information
- TOTP secret for 2FA
- Relationships: patients, images, consultations, notifications

### Patient
- Patient demographics and medical history
- Relationships: images, consultations

### MedicalImage
- Image metadata and Cloudinary references
- Relationships: patient, user

### Consultation
- Consultation details, symptoms, vital signs
- Relationships: patient, doctor, analysis, shares, comments

### Analysis
- AI-generated diagnosis and recommendations
- Relationships: consultation

### Notification
- User notifications for various events
- Relationships: user

**[Database Schema Details →](../docs/ARCHITECTURE.md#database-schema)**

## 🔐 Security

### Authentication
- **JWT tokens** with 15-minute expiry
- **Refresh tokens** with 7-day expiry
- **2FA** with TOTP (Time-based One-Time Password)

### Password Security
- **Argon2** hashing (memory-hard, GPU-resistant)
- Minimum 8 characters required
- Encrypted storage of sensitive data

### API Security
- **CORS** protection
- **SQL injection** prevention via ORM
- **Input validation** with Pydantic
- **Rate limiting** (planned)

## 🧪 Testing

### Run Tests
```bash
pytest
```

### Run with Coverage
```bash
pytest --cov=app --cov-report=html
```

### Test Structure
```
tests/
├── test_auth.py
├── test_patients.py
├── test_images.py
└── test_consultations.py
```

## 🔧 Configuration

### Environment Variables

Required variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/meda

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 📝 Adding New Endpoints

1. **Create endpoint file** in `app/api/v1/endpoints/`
2. **Define Pydantic schemas** for request/response
3. **Create router** with `APIRouter()`
4. **Add endpoint functions** with proper decorators
5. **Register router** in `app/main.py`

Example:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()

@router.get("/items")
async def get_items(db: Session = Depends(get_db)):
    return {"items": []}
```

## 🔄 Database Migrations

### Create Migration
```bash
alembic revision --autogenerate -m "Description"
```

### Apply Migration
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

## 📊 Performance

### Optimization Tips
- Use **database indexing** on frequently queried columns
- Implement **eager loading** with `joinedload()` to avoid N+1 queries
- Use **Redis caching** for frequently accessed data
- Enable **connection pooling** in SQLAlchemy

## 🐛 Debugging

### Enable Debug Mode
```bash
uvicorn app.main:app --reload --log-level debug
```

### View Logs
Logs are output to console in development mode.

### Interactive API Docs
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📚 Additional Resources

- [Architecture Guide](../docs/ARCHITECTURE.md)
- [API Reference](../docs/API_REFERENCE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Main Documentation](../docs/README.md)

---

**Backend Version**: 2.0.0  
**FastAPI Version**: 0.109.0  
**Python Version**: 3.11+
