from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("medical_images.id"), nullable=False)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    confidence_score = Column(Float, nullable=True)
    findings = Column(JSON, nullable=True)
    recommendations = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationship
    image = relationship("MedicalImage", back_populates="analyses")
