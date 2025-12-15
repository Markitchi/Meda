from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.medical import Patient, MedicalImage
from app.models.consultation import Consultation, MedicalHistory
from app.services.comprehensive_diagnosis import ComprehensiveDiagnosisService

router = APIRouter()


class ComprehensiveDiagnosisRequest(BaseModel):
    patient_id: int
    symptoms: List[str]
    vital_signs: dict
    image_ids: List[int] | None = None


@router.post("/comprehensive/{patient_id}")
async def generate_comprehensive_diagnosis(
    patient_id: int,
    request: ComprehensiveDiagnosisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate comprehensive diagnosis for a patient"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    
    # Get medical history
    medical_history = db.query(MedicalHistory).filter(
        MedicalHistory.patient_id == patient_id
    ).all()
    
    # Get images
    images = []
    if request.image_ids:
        images = db.query(MedicalImage).filter(
            MedicalImage.id.in_(request.image_ids),
            MedicalImage.patient_id == patient_id
        ).all()
    
    # Generate comprehensive diagnosis
    diagnosis_result = await ComprehensiveDiagnosisService.diagnose_patient(
        symptoms=request.symptoms,
        vital_signs=request.vital_signs,
        medical_history=medical_history,
        images=images
    )
    
    return diagnosis_result
