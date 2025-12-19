"""
Collaboration API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.collaboration import SharePermission
from app.api.v1.auth import get_current_user
from app.services.collaboration_service import collaboration_service

router = APIRouter()


# Schemas

class ShareRequest(BaseModel):
    user_id: int
    permission: SharePermission = SharePermission.READ


class ShareResponse(BaseModel):
    id: int
    consultation_id: int
    shared_with_user_id: int
    shared_with_name: str
    permission: SharePermission
    created_at: datetime
    
    class Config:
        from_attributes = True


class CommentRequest(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    consultation_id: int
    user_id: int
    user_name: str
    content: str
    created_at: datetime
    updated_at: datetime | None
    
    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    user_id: int | None
    user_name: str | None
    action: str
    changes: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Sharing Endpoints

@router.post("/consultations/{consultation_id}/share", response_model=ShareResponse)
async def share_consultation(
    consultation_id: int,
    share_request: ShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Share a consultation with another user
    
    Args:
        consultation_id: Consultation ID
        share_request: Share request with user_id and permission
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Created share
    """
    # Check if user has access to share (must be owner or have WRITE permission)
    if not collaboration_service.check_access(
        db=db,
        consultation_id=consultation_id,
        user_id=current_user.id,
        required_permission=SharePermission.WRITE
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to share this consultation"
        )
    
    share = collaboration_service.share_consultation(
        db=db,
        consultation_id=consultation_id,
        shared_by_user_id=current_user.id,
        shared_with_user_id=share_request.user_id,
        permission=share_request.permission
    )
    
    # Get shared user name
    from app.models.user import User as UserModel
    shared_user = db.query(UserModel).filter(UserModel.id == share.shared_with_user_id).first()
    
    return ShareResponse(
        id=share.id,
        consultation_id=share.consultation_id,
        shared_with_user_id=share.shared_with_user_id,
        shared_with_name=shared_user.full_name or shared_user.email if shared_user else "Unknown",
        permission=share.permission,
        created_at=share.created_at
    )


@router.get("/consultations/{consultation_id}/shares", response_model=List[ShareResponse])
async def get_consultation_shares(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all shares for a consultation"""
    # Check access
    if not collaboration_service.check_access(
        db=db,
        consultation_id=consultation_id,
        user_id=current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this consultation"
        )
    
    shares = collaboration_service.get_consultation_shares(db, consultation_id)
    
    # Enrich with user names
    from app.models.user import User as UserModel
    result = []
    for share in shares:
        shared_user = db.query(UserModel).filter(UserModel.id == share.shared_with_user_id).first()
        result.append(ShareResponse(
            id=share.id,
            consultation_id=share.consultation_id,
            shared_with_user_id=share.shared_with_user_id,
            shared_with_name=shared_user.full_name or shared_user.email if shared_user else "Unknown",
            permission=share.permission,
            created_at=share.created_at
        ))
    
    return result


@router.delete("/consultations/{consultation_id}/shares/{user_id}")
async def revoke_share(
    consultation_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke access to a consultation"""
    # Check permission
    if not collaboration_service.check_access(
        db=db,
        consultation_id=consultation_id,
        user_id=current_user.id,
        required_permission=SharePermission.WRITE
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to revoke access"
        )
    
    success = collaboration_service.revoke_share(db, consultation_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found"
        )
    
    return {"message": "Access revoked successfully"}


@router.get("/shared-with-me")
async def get_shared_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all consultations shared with the current user"""
    from app.models.collaboration import ConsultationShare
    from app.models.user import User as UserModel
    
    # Get all shares where current user is the recipient
    shares = db.query(ConsultationShare).filter(
        ConsultationShare.shared_with_user_id == current_user.id
    ).all()
    
    # Enrich with user information
    result = []
    for share in shares:
        shared_by_user = db.query(UserModel).filter(UserModel.id == share.shared_by_user_id).first()
        shared_with_user = db.query(UserModel).filter(UserModel.id == share.shared_with_user_id).first()
        
        result.append({
            "id": share.id,
            "consultation_id": share.consultation_id,
            "shared_by_id": share.shared_by_user_id,
            "shared_with_id": share.shared_with_user_id,
            "permission": share.permission.value,
            "created_at": share.created_at.isoformat(),
            "shared_by": {
                "id": shared_by_user.id,
                "email": shared_by_user.email,
                "full_name": shared_by_user.full_name
            } if shared_by_user else None,
            "shared_with": {
                "id": shared_with_user.id,
                "email": shared_with_user.email,
                "full_name": shared_with_user.full_name
            } if shared_with_user else None
        })
    
    return result



# Comment Endpoints

@router.post("/consultations/{consultation_id}/comments", response_model=CommentResponse)
async def add_comment(
    consultation_id: int,
    comment_request: CommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a consultation"""
    # Check access
    if not collaboration_service.check_access(
        db=db,
        consultation_id=consultation_id,
        user_id=current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this consultation"
        )
    
    comment = collaboration_service.add_comment(
        db=db,
        consultation_id=consultation_id,
        user_id=current_user.id,
        content=comment_request.content
    )
    
    return CommentResponse(
        id=comment.id,
        consultation_id=comment.consultation_id,
        user_id=comment.user_id,
        user_name=current_user.full_name or current_user.email,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at
    )


@router.get("/consultations/{consultation_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all comments for a consultation"""
    # Check access
    if not collaboration_service.check_access(
        db=db,
        consultation_id=consultation_id,
        user_id=current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this consultation"
        )
    
    comments = collaboration_service.get_comments(db, consultation_id)
    
    # Enrich with user names
    from app.models.user import User as UserModel
    result = []
    for comment in comments:
        user = db.query(UserModel).filter(UserModel.id == comment.user_id).first()
        result.append(CommentResponse(
            id=comment.id,
            consultation_id=comment.consultation_id,
            user_id=comment.user_id,
            user_name=user.full_name or user.email if user else "Unknown",
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at
        ))
    
    return result


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (only by author)"""
    success = collaboration_service.delete_comment(db, comment_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or you don't have permission to delete it"
        )
    
    return {"message": "Comment deleted successfully"}


# Audit Log Endpoints

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    entity_type: str | None = None,
    entity_id: int | None = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get audit logs (admin or own actions)
    
    Args:
        entity_type: Filter by entity type
        entity_id: Filter by entity ID
        limit: Maximum number of logs
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of audit logs
    """
    # For now, users can only see their own audit logs unless admin
    from app.models.user import UserRole
    if current_user.role != UserRole.ADMIN:
        logs = collaboration_service.get_audit_logs(
            db=db,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=current_user.id,
            limit=limit
        )
    else:
        logs = collaboration_service.get_audit_logs(
            db=db,
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit
        )
    
    # Enrich with user names
    from app.models.user import User as UserModel
    result = []
    for log in logs:
        user = db.query(UserModel).filter(UserModel.id == log.user_id).first() if log.user_id else None
        result.append(AuditLogResponse(
            id=log.id,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            user_id=log.user_id,
            user_name=user.full_name or user.email if user else None,
            action=log.action,
            changes=log.changes,
            created_at=log.created_at
        ))
    
    return result
