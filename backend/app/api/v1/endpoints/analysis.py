from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.medical import MedicalImage
from app.models.analysis import Analysis
from app.services.ai_service import AIService
from pydantic import BaseModel

router = APIRouter()


# Schemas
class AnalysisResponse(BaseModel):
    id: int
    image_id: int
    status: str
    confidence_score: float | None
    findings: dict | None
    recommendations: str | None
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True


class AnalysisCreate(BaseModel):
    image_id: int


# Background task for analysis
async def perform_analysis(analysis_id: int, image_type: str, body_part: str, db: Session):
    """Background task to perform AI analysis"""
    try:
        # Update status to processing
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if analysis:
            analysis.status = "processing"
            db.commit()
        
        # Perform mock analysis
        result = await AIService.analyze_image(image_type, body_part)
        
        # Update analysis with results
        if analysis:
            analysis.status = result["status"]
            analysis.confidence_score = result["confidence_score"]
            analysis.findings = result["findings"]
            analysis.recommendations = result["recommendations"]
            analysis.completed_at = result["completed_at"]
            db.commit()
            
            # Update image status
            image = db.query(MedicalImage).filter(MedicalImage.id == analysis.image_id).first()
            if image:
                image.analysis_status = "completed"
                image.analyzed_at = datetime.utcnow()
                db.commit()
                
    except Exception as e:
        # Mark as failed
        if analysis:
            analysis.status = "failed"
            analysis.recommendations = f"Erreur d'analyse: {str(e)}"
            db.commit()


@router.post("/start/{image_id}", response_model=AnalysisResponse)
async def start_analysis(
    image_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start AI analysis for an image"""
    
    # Check if image exists and belongs to user
    image = db.query(MedicalImage).filter(
        MedicalImage.id == image_id,
        MedicalImage.user_id == current_user.id
    ).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    
    # Check if analysis already exists
    existing = db.query(Analysis).filter(
        Analysis.image_id == image_id,
        Analysis.status.in_(["pending", "processing"])
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Analyse déjà en cours")
    
    # Create new analysis
    analysis = Analysis(
        image_id=image_id,
        status="pending"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Start background analysis
    background_tasks.add_task(
        perform_analysis,
        analysis.id,
        image.image_type.value,
        image.body_part,
        db
    )
    
    return analysis


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analysis by ID"""
    
    analysis = db.query(Analysis).join(MedicalImage).filter(
        Analysis.id == analysis_id,
        MedicalImage.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    return analysis


@router.get("/image/{image_id}", response_model=List[AnalysisResponse])
def get_image_analyses(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all analyses for an image"""
    
    # Check if image belongs to user
    image = db.query(MedicalImage).filter(
        MedicalImage.id == image_id,
        MedicalImage.user_id == current_user.id
    ).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    
    analyses = db.query(Analysis).filter(Analysis.image_id == image_id).all()
    
    return analyses


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an analysis"""
    
    analysis = db.query(Analysis).join(MedicalImage).filter(
        Analysis.id == analysis_id,
        MedicalImage.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    db.delete(analysis)
    db.commit()
    
    return {"message": "Analyse supprimée"}
