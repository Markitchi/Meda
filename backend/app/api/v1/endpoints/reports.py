"""
Endpoints pour la génération de rapports PDF
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.services.pdf_service import pdf_service

router = APIRouter()


@router.get("/consultation/{consultation_id}/pdf")
async def download_consultation_report(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Télécharger le rapport PDF d'une consultation
    
    Args:
        consultation_id: ID de la consultation
        current_user: Utilisateur authentifié
        db: Session de base de données
        
    Returns:
        PDF file stream
    """
    try:
        # Générer le PDF
        pdf_buffer = pdf_service.generate_consultation_report(db, consultation_id)
        
        # Nom du fichier
        filename = f"Rapport_Consultation_{consultation_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        # Retourner le PDF
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération du rapport: {str(e)}"
        )


@router.get("/patient/{patient_id}/pdf")
async def download_patient_report(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Télécharger le rapport PDF complet d'un patient (historique)
    
    Args:
        patient_id: ID du patient
        current_user: Utilisateur authentifié
        db: Session de base de données
        
    Returns:
        PDF file stream
    """
    try:
        # Générer le PDF
        pdf_buffer = pdf_service.generate_patient_report(db, patient_id)
        
        # Nom du fichier
        filename = f"Dossier_Patient_{patient_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        # Retourner le PDF
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération du rapport: {str(e)}"
        )
