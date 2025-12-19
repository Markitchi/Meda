from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    consultation_date = Column(DateTime, default=datetime.utcnow)
    
    # Motif et symptômes
    chief_complaint = Column(String, nullable=False)  # Motif de consultation
    symptoms = Column(JSON, nullable=True)  # Liste des symptômes
    
    # Signes vitaux
    vital_signs = Column(JSON, nullable=True)  # {temperature, blood_pressure, heart_rate, etc.}
    
    # Diagnostic et traitement
    diagnosis = Column(Text, nullable=True)
    ai_diagnosis = Column(JSON, nullable=True)  # Résultat IA
    treatment_plan = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="consultations")
    doctor = relationship("User")
    shares = relationship("ConsultationShare", back_populates="consultation", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="consultation", cascade="all, delete-orphan")



class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    condition = Column(String, nullable=False)  # Maladie/condition
    diagnosed_date = Column(Date, nullable=True)
    status = Column(String, default="active")  # active, resolved, chronic
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    patient = relationship("Patient", back_populates="medical_history_entries")
