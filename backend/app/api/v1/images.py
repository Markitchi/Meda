from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime
from app.core.database import get_db
from app.models.user import User
from app.models.medical import MedicalImage, ImageType, AnalysisStatus
from app.schemas.medical import MedicalImageResponse, MedicalImageCreate
from app.api.v1.auth import get_current_user
from app.services.cloudinary_service import cloudinary_service

router = APIRouter()

ALLOWED_EXTENSIONS = {'.dcm', '.png', '.jpg', '.jpeg', '.tiff', '.tif'}
ALLOWED_MIME_TYPES = {
    'image/png', 'image/jpeg', 'image/tiff',
    'application/dicom', 'application/octet-stream'
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def validate_file(file: UploadFile) -> tuple[bool, str]:
    """Validate uploaded file"""
    # Check file extension
    file_ext = '.' + file.filename.split('.')[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}"
    
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False, f"MIME type not allowed: {file.content_type}"
    
    return True, "OK"

@router.post("/upload", response_model=MedicalImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_medical_image(
    file: UploadFile = File(...),
    image_type: ImageType = Form(...),
    body_part: Optional[str] = Form(None),
    patient_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a medical image"""
    
    # Validate file
    is_valid, message = validate_file(file)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    
    # Read file
    file_content = await file.read()
    file_size = len(file_content)
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024} MB"
        )
    
    # Generate unique filename
    file_ext = '.' + file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    object_name = f"medical_images/{current_user.id}/{unique_filename}"
    
    # Upload to Cloudinary
    try:
        import io
        file_url = cloudinary_service.upload_file(
            io.BytesIO(file_content),
            object_name,
            file.content_type,
            file_size
        )
        file_path = object_name  # Store object name for later retrieval
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
    
    # Create database record
    db_image = MedicalImage(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        image_type=image_type,
        body_part=body_part,
        user_id=current_user.id,
        patient_id=patient_id,
        analysis_status=AnalysisStatus.PENDING
    )
    
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return db_image

@router.get("/", response_model=List[MedicalImageResponse])
async def list_medical_images(
    skip: int = 0,
    limit: int = 100,
    image_type: Optional[ImageType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's medical images"""
    query = db.query(MedicalImage).filter(MedicalImage.user_id == current_user.id)
    
    if image_type:
        query = query.filter(MedicalImage.image_type == image_type)
    
    images = query.order_by(MedicalImage.created_at.desc()).offset(skip).limit(limit).all()
    return images

@router.get("/{image_id}", response_model=MedicalImageResponse)
async def get_medical_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific medical image"""
    image = db.query(MedicalImage).filter(
        MedicalImage.id == image_id,
        MedicalImage.user_id == current_user.id
    ).first()
    
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    return image

@router.get("/{image_id}/download")
async def download_medical_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get download URL for medical image"""
    image = db.query(MedicalImage).filter(
        MedicalImage.id == image_id,
        MedicalImage.user_id == current_user.id
    ).first()
    
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    try:
        # Get URL from Cloudinary
        url = cloudinary_service.get_file_url(image.file_path)
        return {"download_url": url, "expires_in": 3600}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download URL: {str(e)}"
        )

@router.options("/{image_id}")
async def options_medical_image(image_id: int):
    """Handle CORS preflight for DELETE"""
    return {}

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a medical image"""
    image = db.query(MedicalImage).filter(
        MedicalImage.id == image_id,
        MedicalImage.user_id == current_user.id
    ).first()
    
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    # Delete from database (with explicit analysis deletion)
    try:
        # First, explicitly delete all analyses associated with this image
        from app.models.analysis import Analysis
        analyses = db.query(Analysis).filter(Analysis.image_id == image_id).all()
        for analysis in analyses:
            db.delete(analysis)
        print(f"✅ Deleted {len(analyses)} analyses for image {image_id}")
        
        # Then delete the image
        db.delete(image)
        db.commit()
        print(f"✅ Deleted image {image_id} from database")
        
        # Try to delete from Cloudinary (after DB success, non-blocking)
        try:
            if image.file_path:
                cloudinary_service.delete_file(image.file_path)
                print(f"✅ Deleted file from Cloudinary: {image.file_path}")
        except Exception as e:
            print(f"⚠️ Warning: Failed to delete file from MinIO: {e}")
            
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to delete from database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image from database: {str(e)}"
        )
    
    return None
