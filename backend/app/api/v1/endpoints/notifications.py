"""
Notification API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.services.notification_service import notification_service

router = APIRouter()


# Schemas
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    link: str | None
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    count: int


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get notifications for current user
    
    Args:
        unread_only: If True, only return unread notifications
        limit: Maximum number of notifications to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of notifications
    """
    notifications = notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit
    )
    
    return notifications


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Count of unread notifications
    """
    count = notification_service.get_unread_count(
        db=db,
        user_id=current_user.id
    )
    
    return {"count": count}


@router.patch("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a notification as read
    
    Args:
        notification_id: Notification ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    success = notification_service.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}


@router.patch("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Number of notifications marked as read
    """
    count = notification_service.mark_all_as_read(
        db=db,
        user_id=current_user.id
    )
    
    return {"message": f"{count} notifications marked as read", "count": count}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notification
    
    Args:
        notification_id: Notification ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    success = notification_service.delete_notification(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification deleted"}
