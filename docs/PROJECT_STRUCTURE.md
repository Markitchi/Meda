# 📁 Project Structure

This guide helps you navigate the Meda codebase and understand where everything is located.

## 🌳 Directory Tree

```
meda/
├── 📁 backend/                 # FastAPI backend application
│   ├── 📁 app/
│   │   ├── 📁 api/            # API endpoints
│   │   │   └── 📁 v1/         # API version 1
│   │   │       ├── auth.py    # Authentication endpoints
│   │   │       ├── images.py  # Image management
│   │   │       ├── patients.py # Patient CRUD
│   │   │       ├── profile.py # User profile
│   │   │       └── 📁 endpoints/
│   │   │           ├── analysis.py      # AI analysis
│   │   │           ├── consultations.py # Consultations
│   │   │           ├── diagnosis.py     # Diagnosis generation
│   │   │           ├── reports.py       # PDF reports
│   │   │           ├── notifications.py # Notifications
│   │   │           └── collaboration.py # Sharing & comments
│   │   ├── 📁 core/           # Core configuration
│   │   │   ├── config.py      # App settings
│   │   │   ├── database.py    # Database connection
│   │   │   └── security.py    # Security utilities
│   │   ├── 📁 models/         # SQLAlchemy models
│   │   │   ├── user.py        # User model
│   │   │   ├── medical.py     # MedicalImage, Patient
│   │   │   ├── consultation.py # Consultation, MedicalHistory
│   │   │   ├── analysis.py    # Analysis model
│   │   │   └── notification.py # Notification model
│   │   ├── 📁 services/       # Business logic
│   │   │   ├── notification_service.py
│   │   │   ├── diagnosis_service.py
│   │   │   ├── report_service.py
│   │   │   └── collaboration_service.py
│   │   └── main.py           # FastAPI app entry point
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile.prod       # Production Docker config
│
├── 📁 frontend/               # Next.js frontend application
│   ├── 📁 app/               # Next.js App Router pages
│   │   ├── 📁 (auth)/        # Authentication pages
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Registration page
│   │   ├── 📁 dashboard/     # Dashboard page
│   │   ├── 📁 patients/      # Patient management
│   │   │   ├── page.tsx      # Patient list
│   │   │   ├── new/          # Create patient
│   │   │   └── [id]/         # Patient details
│   │   ├── 📁 images/        # Image gallery
│   │   ├── 📁 consultations/ # Consultations
│   │   │   ├── page.tsx      # Consultation list
│   │   │   ├── new/          # Create consultation
│   │   │   └── [id]/         # Consultation details
│   │   ├── 📁 reports/       # Reports page
│   │   ├── 📁 profile/       # User profile
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── 📁 components/        # Reusable React components
│   │   ├── 📁 image-viewer/  # Medical image viewer
│   │   │   ├── ImageViewer.tsx
│   │   │   ├── ImageControls.tsx
│   │   │   └── AnnotationTools.tsx
│   │   ├── 📁 notifications/ # Notification system
│   │   │   └── NotificationBell.tsx
│   │   └── 📁 ui/           # UI components (Shadcn)
│   ├── 📁 lib/              # Utilities and API clients
│   │   ├── api.ts           # Main API client
│   │   ├── api-notifications.ts
│   │   ├── api-collaboration.ts
│   │   └── utils.ts         # Utility functions
│   ├── package.json         # Node dependencies
│   ├── tailwind.config.ts   # Tailwind configuration
│   └── Dockerfile.prod      # Production Docker config
│
├── 📁 docs/                  # Documentation (you are here!)
│   ├── README.md            # Documentation hub
│   ├── GETTING_STARTED.md   # Installation guide
│   ├── ARCHITECTURE.md      # System architecture
│   ├── API_REFERENCE.md     # API documentation
│   ├── PROJECT_STRUCTURE.md # This file
│   ├── FEATURES.md          # Feature documentation
│   ├── QUICK_START.md       # Quick start guide
│   ├── DIAGRAMS.md          # Architecture diagrams
│   └── 📁 demo/            # Demo videos and screenshots
│       ├── README.md        # Demo guide
│       └── Meda_demo.mp4    # Full demo video
│
├── 📁 scripts/              # Utility scripts
│   ├── start-backend.ps1    # Start backend server
│   ├── start-frontend.bat   # Start frontend server
│   ├── install-backend.ps1  # Install backend deps
│   └── generate-diagrams.ps1 # Generate diagrams
│
├── 📁 docker/               # Docker configuration
│   └── ...                  # Docker-related files
│
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── docker-compose.yml      # Docker Compose config
├── README.md               # Main project README
├── PROJECT_SUMMARY.md      # Development summary
├── CAHIER_DES_CHARGES_MEDA_FR.md # Specifications (French)
└── CONTRIBUTING.md         # Contribution guidelines
```

## 🔍 Finding Specific Functionality

### Authentication & Security
- **Backend**: `backend/app/api/v1/auth.py`
- **Frontend**: `frontend/app/(auth)/`
- **Models**: `backend/app/models/user.py`
- **Security Utils**: `backend/app/core/security.py`

### Patient Management
- **Backend API**: `backend/app/api/v1/patients.py`
- **Frontend Pages**: `frontend/app/patients/`
- **Database Model**: `backend/app/models/medical.py` (Patient class)

### Medical Images
- **Backend API**: `backend/app/api/v1/images.py`
- **Frontend Pages**: `frontend/app/images/`
- **Image Viewer**: `frontend/components/image-viewer/`
- **Database Model**: `backend/app/models/medical.py` (MedicalImage class)

### AI Diagnosis
- **Backend API**: `backend/app/api/v1/endpoints/diagnosis.py`
- **Service Layer**: `backend/app/services/diagnosis_service.py`
- **Database Model**: `backend/app/models/analysis.py`

### Consultations
- **Backend API**: `backend/app/api/v1/endpoints/consultations.py`
- **Frontend Pages**: `frontend/app/consultations/`
- **Database Model**: `backend/app/models/consultation.py`

### Notifications
- **Backend API**: `backend/app/api/v1/endpoints/notifications.py`
- **Frontend Component**: `frontend/components/notifications/NotificationBell.tsx`
- **Service Layer**: `backend/app/services/notification_service.py`
- **Database Model**: `backend/app/models/notification.py`

### Collaboration (Sharing & Comments)
- **Backend API**: `backend/app/api/v1/endpoints/collaboration.py`
- **Service Layer**: `backend/app/services/collaboration_service.py`
- **Database Models**: `backend/app/models/consultation.py` (ConsultationShare, Comment)

### PDF Reports
- **Backend API**: `backend/app/api/v1/endpoints/reports.py`
- **Service Layer**: `backend/app/services/report_service.py`
- **Frontend Page**: `frontend/app/reports/`

## 📝 File Naming Conventions

### Backend (Python)
- **Models**: `snake_case.py` (e.g., `medical_image.py`)
- **API Endpoints**: `snake_case.py` (e.g., `patients.py`)
- **Services**: `*_service.py` (e.g., `notification_service.py`)
- **Classes**: `PascalCase` (e.g., `MedicalImage`)
- **Functions**: `snake_case` (e.g., `get_current_user`)

### Frontend (TypeScript/React)
- **Components**: `PascalCase.tsx` (e.g., `NotificationBell.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Utilities**: `camelCase.ts` (e.g., `api.ts`)
- **Types**: `PascalCase` for interfaces (e.g., `Notification`)

## 🗂️ Module Dependencies

### Backend Dependencies
```
main.py
├── api/v1/auth.py → models/user.py, core/security.py
├── api/v1/patients.py → models/medical.py
├── api/v1/images.py → models/medical.py
├── api/v1/endpoints/diagnosis.py → services/diagnosis_service.py
├── api/v1/endpoints/notifications.py → services/notification_service.py
└── api/v1/endpoints/collaboration.py → services/collaboration_service.py
```

### Frontend Dependencies
```
app/layout.tsx
├── app/dashboard/page.tsx → lib/api.ts
├── app/patients/page.tsx → lib/api.ts
├── app/consultations/[id]/page.tsx → lib/api.ts, components/image-viewer/
└── components/notifications/NotificationBell.tsx → lib/api-notifications.ts
```

## 🎯 Common Tasks

### Adding a New API Endpoint

1. **Create endpoint**: `backend/app/api/v1/endpoints/your_feature.py`
2. **Create model** (if needed): `backend/app/models/your_model.py`
3. **Create service** (if needed): `backend/app/services/your_service.py`
4. **Register router**: Add to `backend/app/main.py`

### Adding a New Frontend Page

1. **Create page**: `frontend/app/your-page/page.tsx`
2. **Create API client** (if needed): `frontend/lib/api-your-feature.ts`
3. **Add navigation**: Update navigation component

### Adding a New Component

1. **Create component**: `frontend/components/your-component/YourComponent.tsx`
2. **Import and use**: In your page or parent component

## 📦 Key Dependencies

### Backend
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **Alembic**: Database migrations
- **Argon2**: Password hashing
- **PyJWT**: JWT tokens
- **Cloudinary**: Image storage
- **ReportLab**: PDF generation

### Frontend
- **Next.js**: React framework
- **React**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Konva**: Canvas manipulation
- **Shadcn/UI**: Component library

## 🔗 Related Documentation

- [Architecture Guide](ARCHITECTURE.md) - System design
- [API Reference](API_REFERENCE.md) - API endpoints
- [Getting Started](GETTING_STARTED.md) - Setup guide
- [Contributing](../CONTRIBUTING.md) - Development guidelines

---

**Last Updated**: December 19, 2024
