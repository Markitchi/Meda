from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.medical import ImageType, AnalysisStatus

# Medical Image Schemas
class MedicalImageBase(BaseModel):
    image_type: ImageType
    body_part: Optional[str] = None
    patient_id: Optional[int] = None

class MedicalImageCreate(MedicalImageBase):
    pass

class MedicalImageResponse(MedicalImageBase):
    id: int
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    analysis_status: AnalysisStatus
    confidence_score: Optional[float] = None
    created_at: datetime
    analyzed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AnalysisResult(BaseModel):
    image_id: int
    predictions: list[dict]
    confidence_score: float
    processing_time: float
    model_used: str

# Patient Schemas
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None

class PatientCreate(PatientBase):
    patient_id: str = Field(..., description="External patient ID")

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    patient_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
