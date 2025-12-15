from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from pydantic import BaseModel

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.medical import Patient
from app.models.consultation import Consultation, MedicalHistory

router = APIRouter()


# Schemas
class VitalSigns(BaseModel):
    temperature: float | None = None
    blood_pressure: str | None = None
    heart_rate: int | None = None
    respiratory_rate: int | None = None
    oxygen_saturation: int | None = None
    weight: float | None = None
    height: float | None = None


class ConsultationCreate(BaseModel):
    patient_id: int
    chief_complaint: str
    symptoms: List[str] | None = None
    vital_signs: VitalSigns | None = None
    diagnosis: str | None = None
    treatment_plan: str | None = None
    notes: str | None = None


class ConsultationResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    consultation_date: datetime
    chief_complaint: str
    symptoms: List[str] | None
    vital_signs: dict | None
    diagnosis: str | None
    ai_diagnosis: dict | None
    treatment_plan: str | None
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class MedicalHistoryCreate(BaseModel):
    patient_id: int
    condition: str
    diagnosed_date: date | None = None
    status: str = "active"
    notes: str | None = None


class MedicalHistoryResponse(BaseModel):
    id: int
    patient_id: int
    condition: str
    diagnosed_date: date | None
    status: str
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# Consultation Endpoints
@router.post("/consultations/", response_model=ConsultationResponse)
def create_consultation(
    consultation: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new consultation"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == consultation.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    # Create consultation
    db_consultation = Consultation(
        patient_id=consultation.patient_id,
        doctor_id=current_user.id,
        chief_complaint=consultation.chief_complaint,
        symptoms=consultation.symptoms,
        vital_signs=consultation.vital_signs.dict() if consultation.vital_signs else None,
        diagnosis=consultation.diagnosis,
        treatment_plan=consultation.treatment_plan,
        notes=consultation.notes
    )
    
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    
    return db_consultation


@router.get("/consultations/patient/{patient_id}", response_model=List[ConsultationResponse])
def get_patient_consultations(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all consultations for a patient"""
    
    consultations = db.query(Consultation).filter(
        Consultation.patient_id == patient_id
    ).order_by(Consultation.consultation_date.desc()).all()
    
    return consultations


@router.get("/consultations/{consultation_id}", response_model=ConsultationResponse)
def get_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consultation by ID"""
    
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation non trouvée")
    
    return consultation


@router.patch("/consultations/{consultation_id}", response_model=ConsultationResponse)
def update_consultation(
    consultation_id: int,
    consultation_data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a consultation"""
    
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation non trouvée")
    
    # Update fields
    consultation.chief_complaint = consultation_data.chief_complaint
    consultation.symptoms = consultation_data.symptoms
    consultation.vital_signs = consultation_data.vital_signs.dict() if consultation_data.vital_signs else None
    consultation.diagnosis = consultation_data.diagnosis
    consultation.treatment_plan = consultation_data.treatment_plan
    consultation.notes = consultation_data.notes
    consultation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(consultation)
    
    return consultation


# Medical History Endpoints
@router.post("/medical-history/", response_model=MedicalHistoryResponse)
def create_medical_history(
    history: MedicalHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add medical history entry"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == history.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    db_history = MedicalHistory(
        patient_id=history.patient_id,
        condition=history.condition,
        diagnosed_date=history.diagnosed_date,
        status=history.status,
        notes=history.notes
    )
    
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    
    return db_history


@router.get("/medical-history/patient/{patient_id}", response_model=List[MedicalHistoryResponse])
def get_patient_medical_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get medical history for a patient"""
    
    history = db.query(MedicalHistory).filter(
        MedicalHistory.patient_id == patient_id
    ).order_by(MedicalHistory.created_at.desc()).all()
    
    return history


@router.delete("/medical-history/{history_id}")
def delete_medical_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete medical history entry"""
    
    history = db.query(MedicalHistory).filter(
        MedicalHistory.id == history_id
    ).first()
    
    if not history:
        raise HTTPException(status_code=404, detail="Antécédent non trouvé")
    
    db.delete(history)
    db.commit()
    
    return {"message": "Antécédent supprimé"}
