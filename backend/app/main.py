from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, images

# Import all models to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.medical import MedicalImage, Patient
from app.models.analysis import Analysis
from app.models.consultation import Consultation, MedicalHistory

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API de diagnostic médical assisté par IA",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  # Explicitly list all methods
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Bienvenue sur l'API Meda",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

@app.get("/test-db")
async def test_database():
    """Test database connection"""
    try:
        from app.core.database import SessionLocal
        db = SessionLocal()
        result = db.execute("SELECT 1").scalar()
        db.close()
        return {"status": "ok", "database": "connected", "result": result}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(images.router, prefix="/api/v1/images", tags=["Medical Images"])

# Import patients router
from app.api.v1 import patients
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])

# Import profile router
from app.api.v1 import profile
app.include_router(profile.router, prefix="/api/v1/profile", tags=["Profile"])

# Import analysis router
from app.api.v1.endpoints import analysis
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["AI Analysis"])

# Import consultations router
from app.api.v1.endpoints import consultations
app.include_router(consultations.router, prefix="/api/v1", tags=["Consultations & Medical History"])

# Import comprehensive diagnosis router
from app.api.v1.endpoints import diagnosis
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["Comprehensive Diagnosis"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
