"""
Notification service for creating and managing notifications
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.notification import Notification
from app.models.user import User


class NotificationService:
    """Service for managing notifications"""
    
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        link: Optional[str] = None
    ) -> Notification:
        """
        Create a new notification
        
        Args:
            db: Database session
            user_id: ID of user to notify
            notification_type: Type of notification (share, comment, mention, analysis_ready)
            title: Notification title
            message: Notification message
            link: Optional link to navigate to
            
        Returns:
            Created notification
        """
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            link=link
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """
        Get notifications for a user
        
        Args:
            db: Database session
            user_id: User ID
            unread_only: If True, only return unread notifications
            limit: Maximum number of notifications to return
            
        Returns:
            List of notifications
        """
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """
        Get count of unread notifications for a user
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Count of unread notifications
        """
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        """
        Mark a notification as read
        
        Args:
            db: Database session
            notification_id: Notification ID
            user_id: User ID (for security check)
            
        Returns:
            True if successful, False otherwise
        """
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            return False
        
        notification.is_read = True
        db.commit()
        
        return True
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """
        Mark all notifications as read for a user
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Number of notifications marked as read
        """
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        
        db.commit()
        
        return count
    
    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """
        Delete a notification
        
        Args:
            db: Database session
            notification_id: Notification ID
            user_id: User ID (for security check)
            
        Returns:
            True if successful, False otherwise
        """
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            return False
        
        db.delete(notification)
        db.commit()
        
        return True
    
    # Helper methods for specific notification types
    
    @staticmethod
    def notify_consultation_shared(
        db: Session,
        recipient_id: int,
        sharer_name: str,
        consultation_id: int
    ):
        """Notify user that a consultation was shared with them"""
        return NotificationService.create_notification(
            db=db,
            user_id=recipient_id,
            notification_type="share",
            title="Consultation partagée",
            message=f"{sharer_name} a partagé une consultation avec vous",
            link=f"/consultations/{consultation_id}"
        )
    
    @staticmethod
    def notify_new_comment(
        db: Session,
        recipient_id: int,
        commenter_name: str,
        consultation_id: int
    ):
        """Notify user of a new comment on a consultation"""
        return NotificationService.create_notification(
            db=db,
            user_id=recipient_id,
            notification_type="comment",
            title="Nouveau commentaire",
            message=f"{commenter_name} a commenté une consultation",
            link=f"/consultations/{consultation_id}"
        )
    
    @staticmethod
    def notify_analysis_ready(
        db: Session,
        user_id: int,
        patient_name: str,
        consultation_id: int
    ):
        """Notify user that an AI analysis is ready"""
        return NotificationService.create_notification(
            db=db,
            user_id=user_id,
            notification_type="analysis_ready",
            title="Analyse IA disponible",
            message=f"L'analyse IA pour {patient_name} est prête",
            link=f"/consultations/{consultation_id}"
        )


# Singleton instance
notification_service = NotificationService()
