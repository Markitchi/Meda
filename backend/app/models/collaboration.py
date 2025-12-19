"""
Collaboration models for consultation sharing and comments
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class SharePermission(str, enum.Enum):
    """Permission levels for shared consultations"""
    READ = "read"
    WRITE = "write"


class ConsultationShare(Base):
    """Model for sharing consultations between users"""
    __tablename__ = "consultation_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    shared_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shared_with_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    permission = Column(Enum(SharePermission), default=SharePermission.READ, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    consultation = relationship("Consultation", back_populates="shares")
    shared_by = relationship("User", foreign_keys=[shared_by_user_id])
    shared_with = relationship("User", foreign_keys=[shared_with_user_id])
    
    def __repr__(self):
        return f"<ConsultationShare {self.id}: consultation {self.consultation_id} shared with user {self.shared_with_user_id}>"


class Comment(Base):
    """Model for comments on consultations"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    consultation = relationship("Consultation", back_populates="comments")
    user = relationship("User")
    
    def __repr__(self):
        return f"<Comment {self.id} on consultation {self.consultation_id}>"


class AuditLog(Base):
    """Model for tracking changes to entities"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # 'consultation', 'patient', etc.
    entity_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False)  # 'create', 'update', 'delete', 'share'
    changes = Column(Text, nullable=True)  # JSON string of changes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog {self.id}: {self.action} on {self.entity_type} {self.entity_id}>"
