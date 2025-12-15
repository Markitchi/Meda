from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ImageType(str, enum.Enum):
    """Medical image types"""
    XRAY = "xray"
    CT = "ct"
    MRI = "mri"
    RETINAL = "retinal"
    ULTRASOUND = "ultrasound"
    OTHER = "other"

class AnalysisStatus(str, enum.Enum):
    """Analysis status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class MedicalImage(Base):
    """Medical image model"""
    __tablename__ = "medical_images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # MinIO path
    file_size = Column(Integer)  # bytes
    mime_type = Column(String)
    
    # Image metadata
    image_type = Column(Enum(ImageType), nullable=False)
    modality = Column(String, nullable=True)  # DICOM modality
    body_part = Column(String, nullable=True)
    
    # Analysis
    analysis_status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    analysis_result = Column(String, nullable=True)  # JSON string
    confidence_score = Column(Float, nullable=True)
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    
    # Relationship to analyses - cascade delete
    analyses = relationship("Analysis", back_populates="image", cascade="all, delete-orphan")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    analyzed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    analyses = relationship("Analysis", back_populates="image")

    def __repr__(self):
        return f"<MedicalImage {self.filename}>"

class Patient(Base):
    """Patient model"""
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True)  # External patient ID
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    
    # Medical info
    medical_history = Column(String, nullable=True)
    allergies = Column(String, nullable=True)
    current_medications = Column(String, nullable=True)
    
    # Contact
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    
    # Relationships
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    consultations = relationship("Consultation", back_populates="patient")
    medical_history_entries = relationship("MedicalHistory", back_populates="patient")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Patient {self.first_name} {self.last_name}>"
