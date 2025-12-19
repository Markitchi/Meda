"""
Collaboration service for consultation sharing and comments
"""
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.models.collaboration import ConsultationShare, Comment, AuditLog, SharePermission
from app.models.consultation import Consultation
from app.models.user import User
from app.services.notification_service import notification_service


class CollaborationService:
    """Service for managing consultation collaboration"""
    
    # Consultation Sharing
    
    @staticmethod
    def share_consultation(
        db: Session,
        consultation_id: int,
        shared_by_user_id: int,
        shared_with_user_id: int,
        permission: SharePermission = SharePermission.READ
    ) -> ConsultationShare:
        """
        Share a consultation with another user
        
        Args:
            db: Database session
            consultation_id: Consultation ID
            shared_by_user_id: User sharing the consultation
            shared_with_user_id: User receiving access
            permission: Permission level (READ or WRITE)
            
        Returns:
            Created share
        """
        # Check if already shared
        existing = db.query(ConsultationShare).filter(
            ConsultationShare.consultation_id == consultation_id,
            ConsultationShare.shared_with_user_id == shared_with_user_id
        ).first()
        
        if existing:
            # Update permission
            existing.permission = permission
            db.commit()
            db.refresh(existing)
            return existing
        
        # Create new share
        share = ConsultationShare(
            consultation_id=consultation_id,
            shared_by_user_id=shared_by_user_id,
            shared_with_user_id=shared_with_user_id,
            permission=permission
        )
        
        db.add(share)
        db.commit()
        db.refresh(share)
        
        # Create notification
        shared_by = db.query(User).filter(User.id == shared_by_user_id).first()
        if shared_by:
            notification_service.notify_consultation_shared(
                db=db,
                recipient_id=shared_with_user_id,
                sharer_name=shared_by.full_name or shared_by.email,
                consultation_id=consultation_id
            )
        
        # Log action
        CollaborationService.log_action(
            db=db,
            entity_type="consultation",
            entity_id=consultation_id,
            user_id=shared_by_user_id,
            action="share",
            changes=json.dumps({
                "shared_with_user_id": shared_with_user_id,
                "permission": permission.value
            })
        )
        
        return share
    
    @staticmethod
    def get_consultation_shares(
        db: Session,
        consultation_id: int
    ) -> List[ConsultationShare]:
        """Get all shares for a consultation"""
        return db.query(ConsultationShare).filter(
            ConsultationShare.consultation_id == consultation_id
        ).all()
    
    @staticmethod
    def revoke_share(
        db: Session,
        consultation_id: int,
        user_id: int
    ) -> bool:
        """
        Revoke access to a consultation
        
        Args:
            db: Database session
            consultation_id: Consultation ID
            user_id: User to revoke access from
            
        Returns:
            True if successful
        """
        share = db.query(ConsultationShare).filter(
            ConsultationShare.consultation_id == consultation_id,
            ConsultationShare.shared_with_user_id == user_id
        ).first()
        
        if not share:
            return False
        
        db.delete(share)
        db.commit()
        
        return True
    
    @staticmethod
    def check_access(
        db: Session,
        consultation_id: int,
        user_id: int,
        required_permission: SharePermission = SharePermission.READ
    ) -> bool:
        """
        Check if user has access to consultation
        
        Args:
            db: Database session
            consultation_id: Consultation ID
            user_id: User ID
            required_permission: Minimum permission required
            
        Returns:
            True if user has access
        """
        # Check if user is the doctor
        consultation = db.query(Consultation).filter(
            Consultation.id == consultation_id
        ).first()
        
        if not consultation:
            return False
        
        if consultation.doctor_id == user_id:
            return True
        
        # Check if shared
        share = db.query(ConsultationShare).filter(
            ConsultationShare.consultation_id == consultation_id,
            ConsultationShare.shared_with_user_id == user_id
        ).first()
        
        if not share:
            return False
        
        if required_permission == SharePermission.WRITE:
            return share.permission == SharePermission.WRITE
        
        return True
    
    # Comments
    
    @staticmethod
    def add_comment(
        db: Session,
        consultation_id: int,
        user_id: int,
        content: str
    ) -> Comment:
        """
        Add a comment to a consultation
        
        Args:
            db: Database session
            consultation_id: Consultation ID
            user_id: User adding comment
            content: Comment content
            
        Returns:
            Created comment
        """
        comment = Comment(
            consultation_id=consultation_id,
            user_id=user_id,
            content=content
        )
        
        db.add(comment)
        db.commit()
        db.refresh(comment)
        
        # Notify consultation owner and other collaborators
        consultation = db.query(Consultation).filter(
            Consultation.id == consultation_id
        ).first()
        
        if consultation:
            commenter = db.query(User).filter(User.id == user_id).first()
            commenter_name = commenter.full_name or commenter.email if commenter else "Un utilisateur"
            
            # Notify doctor if not the commenter
            if consultation.doctor_id != user_id:
                notification_service.notify_new_comment(
                    db=db,
                    recipient_id=consultation.doctor_id,
                    commenter_name=commenter_name,
                    consultation_id=consultation_id
                )
            
            # Notify other collaborators
            shares = CollaborationService.get_consultation_shares(db, consultation_id)
            for share in shares:
                if share.shared_with_user_id != user_id:
                    notification_service.notify_new_comment(
                        db=db,
                        recipient_id=share.shared_with_user_id,
                        commenter_name=commenter_name,
                        consultation_id=consultation_id
                    )
        
        # Log action
        CollaborationService.log_action(
            db=db,
            entity_type="consultation",
            entity_id=consultation_id,
            user_id=user_id,
            action="comment",
            changes=json.dumps({"comment_id": comment.id})
        )
        
        return comment
    
    @staticmethod
    def get_comments(
        db: Session,
        consultation_id: int
    ) -> List[Comment]:
        """Get all comments for a consultation"""
        return db.query(Comment).filter(
            Comment.consultation_id == consultation_id
        ).order_by(Comment.created_at.asc()).all()
    
    @staticmethod
    def delete_comment(
        db: Session,
        comment_id: int,
        user_id: int
    ) -> bool:
        """
        Delete a comment (only by author)
        
        Args:
            db: Database session
            comment_id: Comment ID
            user_id: User attempting to delete
            
        Returns:
            True if successful
        """
        comment = db.query(Comment).filter(
            Comment.id == comment_id,
            Comment.user_id == user_id
        ).first()
        
        if not comment:
            return False
        
        db.delete(comment)
        db.commit()
        
        return True
    
    # Audit Logging
    
    @staticmethod
    def log_action(
        db: Session,
        entity_type: str,
        entity_id: int,
        user_id: int,
        action: str,
        changes: Optional[str] = None
    ) -> AuditLog:
        """
        Log an action for audit trail
        
        Args:
            db: Database session
            entity_type: Type of entity (consultation, patient, etc.)
            entity_id: Entity ID
            user_id: User performing action
            action: Action performed
            changes: JSON string of changes
            
        Returns:
            Created audit log
        """
        log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            action=action,
            changes=changes
        )
        
        db.add(log)
        db.commit()
        db.refresh(log)
        
        return log
    
    @staticmethod
    def get_audit_logs(
        db: Session,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        user_id: Optional[int] = None,
        limit: int = 100
    ) -> List[AuditLog]:
        """
        Get audit logs with optional filters
        
        Args:
            db: Database session
            entity_type: Filter by entity type
            entity_id: Filter by entity ID
            user_id: Filter by user
            limit: Maximum number of logs
            
        Returns:
            List of audit logs
        """
        query = db.query(AuditLog)
        
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if entity_id:
            query = query.filter(AuditLog.entity_id == entity_id)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        return query.order_by(AuditLog.created_at.desc()).limit(limit).all()


# Singleton instance
collaboration_service = CollaborationService()
