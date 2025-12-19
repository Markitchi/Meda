"""
Service de génération de rapports PDF pour consultations et patients
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.consultation import Consultation
from app.models.medical import Patient, MedicalImage
from app.models.user import User


class PDFReportService:
    """Service de génération de rapports PDF médicaux"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Configure les styles personnalisés pour le PDF"""
        # Style titre principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#047857'),  # Vert médical
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Style sous-titre
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#047857'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Style texte normal
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=6
        ))
    
    def _add_header(self, elements: list, title: str, subtitle: str = ""):
        """Ajoute l'en-tête du rapport"""
        # Titre principal
        elements.append(Paragraph(title, self.styles['CustomTitle']))
        if subtitle:
            elements.append(Paragraph(subtitle, self.styles['Normal']))
        elements.append(Spacer(1, 0.5*cm))
        
        # Ligne de séparation
        line_table = Table([['']], colWidths=[18*cm])
        line_table.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, 0), 2, colors.HexColor('#047857')),
        ]))
        elements.append(line_table)
        elements.append(Spacer(1, 0.5*cm))
    
    def _add_patient_info(self, elements: list, patient: Patient):
        """Ajoute les informations du patient"""
        elements.append(Paragraph("Informations Patient", self.styles['CustomHeading']))
        
        # Construct full name from first_name and last_name
        full_name = f"{patient.first_name} {patient.last_name}"
        
        data = [
            ['Nom complet:', full_name],
            ['Date de naissance:', patient.date_of_birth.strftime('%d/%m/%Y') if patient.date_of_birth else 'Non renseignée'],
            ['Sexe:', patient.gender or 'Non renseigné'],
            ['Téléphone:', patient.phone or 'Non renseigné'],
            ['Email:', patient.email or 'Non renseigné'],
        ]
        
        table = Table(data, colWidths=[5*cm, 13*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0fdf4')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#047857')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.5*cm))
    
    def _add_consultation_details(self, elements: list, consultation: Consultation):
        """Ajoute les détails de la consultation"""
        elements.append(Paragraph("Détails de la Consultation", self.styles['CustomHeading']))
        
        # Date et motif
        elements.append(Paragraph(
            f"<b>Date:</b> {consultation.consultation_date.strftime('%d/%m/%Y à %H:%M') if consultation.consultation_date else consultation.created_at.strftime('%d/%m/%Y à %H:%M')}",
            self.styles['CustomBody']
        ))
        elements.append(Paragraph(
            f"<b>Motif:</b> {consultation.chief_complaint or 'Non spécifié'}",
            self.styles['CustomBody']
        ))
        elements.append(Spacer(1, 0.3*cm))
        
        # Diagnostic
        if consultation.diagnosis:
            elements.append(Paragraph("<b>Diagnostic:</b>", self.styles['CustomBody']))
            elements.append(Paragraph(consultation.diagnosis, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.3*cm))
        
        # Plan de traitement
        if consultation.treatment_plan:
            elements.append(Paragraph("<b>Plan de Traitement:</b>", self.styles['CustomBody']))
            elements.append(Paragraph(consultation.treatment_plan, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.3*cm))
        
        # Notes
        if consultation.notes:
            elements.append(Paragraph("<b>Notes:</b>", self.styles['CustomBody']))
            elements.append(Paragraph(consultation.notes, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.3*cm))
    
    def _add_diagnosis(self, elements: list, consultation: Consultation):
        """Ajoute le diagnostic IA si disponible"""
        # Skip if no AI diagnosis available
        return
    
    def _add_footer(self, elements: list, doctor: User):
        """Ajoute le pied de page avec signature"""
        elements.append(Spacer(1, 1*cm))
        
        # Ligne de séparation
        line_table = Table([['']], colWidths=[18*cm])
        line_table.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.grey),
        ]))
        elements.append(line_table)
        elements.append(Spacer(1, 0.3*cm))
        
        # Signature
        elements.append(Paragraph(
            f"<b>Médecin:</b> Dr. {doctor.full_name or doctor.email}",
            self.styles['CustomBody']
        ))
        
        elements.append(Spacer(1, 0.3*cm))
        elements.append(Paragraph(
            f"<i>Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</i>",
            self.styles['Normal']
        ))
    
    def generate_consultation_report(
        self,
        db: Session,
        consultation_id: int
    ) -> BytesIO:
        """
        Génère un rapport PDF pour une consultation
        
        Args:
            db: Session de base de données
            consultation_id: ID de la consultation
            
        Returns:
            BytesIO contenant le PDF
        """
        # Récupérer la consultation
        consultation = db.query(Consultation).filter(
            Consultation.id == consultation_id
        ).first()
        
        if not consultation:
            raise ValueError(f"Consultation {consultation_id} non trouvée")
        
        # Créer le buffer PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Éléments du document
        elements = []
        
        # En-tête
        self._add_header(
            elements,
            "RAPPORT DE CONSULTATION MÉDICALE",
            "Système de Diagnostic Assisté par IA - Meda"
        )
        
        # Informations patient
        self._add_patient_info(elements, consultation.patient)
        
        # Détails consultation
        self._add_consultation_details(elements, consultation)
        
        # Diagnostic IA
        self._add_diagnosis(elements, consultation)
        
        # Pied de page
        self._add_footer(elements, consultation.doctor)
        
        # Générer le PDF
        doc.build(elements)
        buffer.seek(0)
        
        return buffer
    
    def generate_patient_report(
        self,
        db: Session,
        patient_id: int
    ) -> BytesIO:
        """
        Génère un rapport PDF complet pour un patient (historique)
        
        Args:
            db: Session de base de données
            patient_id: ID du patient
            
        Returns:
            BytesIO contenant le PDF
        """
        # Récupérer le patient
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        
        if not patient:
            raise ValueError(f"Patient {patient_id} non trouvé")
        
        # Créer le buffer PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Éléments du document
        elements = []
        
        # En-tête
        self._add_header(
            elements,
            "DOSSIER MÉDICAL PATIENT",
            "Historique Complet - Système Meda"
        )
        
        # Informations patient
        self._add_patient_info(elements, patient)
        
        # Antécédents médicaux
        if patient.medical_histories:
            elements.append(Paragraph("Antécédents Médicaux", self.styles['CustomHeading']))
            for history in patient.medical_histories:
                if history.conditions:
                    elements.append(Paragraph("<b>Conditions:</b>", self.styles['CustomBody']))
                    for condition in history.conditions:
                        elements.append(Paragraph(f"• {condition}", self.styles['CustomBody']))
                
                if history.allergies:
                    elements.append(Paragraph("<b>Allergies:</b>", self.styles['CustomBody']))
                    for allergy in history.allergies:
                        elements.append(Paragraph(f"• {allergy}", self.styles['CustomBody']))
                
                if history.medications:
                    elements.append(Paragraph("<b>Médicaments:</b>", self.styles['CustomBody']))
                    for med in history.medications:
                        elements.append(Paragraph(f"• {med}", self.styles['CustomBody']))
            
            elements.append(Spacer(1, 0.5*cm))
        
        # Consultations
        consultations = db.query(Consultation).filter(
            Consultation.patient_id == patient_id
        ).order_by(Consultation.created_at.desc()).all()
        
        if consultations:
            elements.append(Paragraph(
                f"Historique des Consultations ({len(consultations)} consultations)",
                self.styles['CustomHeading']
            ))
            
            for i, consultation in enumerate(consultations, 1):
                elements.append(Paragraph(
                    f"<b>Consultation #{i} - {consultation.consultation_date.strftime('%d/%m/%Y') if consultation.consultation_date else consultation.created_at.strftime('%d/%m/%Y')}</b>",
                    self.styles['CustomBody']
                ))
                
                if consultation.chief_complaint:
                    elements.append(Paragraph(f"Motif: {consultation.chief_complaint}", self.styles['CustomBody']))
                
                if consultation.diagnosis:
                    elements.append(Paragraph(
                        f"Diagnostic: {consultation.diagnosis}",
                        self.styles['CustomBody']
                    ))
                
                elements.append(Spacer(1, 0.3*cm))
                
                # Page break après chaque 2 consultations pour lisibilité
                if i % 2 == 0 and i < len(consultations):
                    elements.append(PageBreak())
        
        # Pied de page
        elements.append(Spacer(1, 1*cm))
        elements.append(Paragraph(
            f"<i>Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</i>",
            self.styles['Normal']
        ))
        
        # Générer le PDF
        doc.build(elements)
        buffer.seek(0)
        
        return buffer


# Instance singleton
pdf_service = PDFReportService()
