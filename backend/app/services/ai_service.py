import random
import time
from datetime import datetime
from typing import Dict, Any
import asyncio


class AIService:
    """Mock AI service for medical image analysis"""
    
    @staticmethod
    async def analyze_image(image_type: str, body_part: str = None) -> Dict[str, Any]:
        """
        Simulate AI analysis of medical image
        
        Args:
            image_type: Type of medical image (xray, ct, mri, etc.)
            body_part: Optional body part being imaged
            
        Returns:
            Dictionary containing analysis results
        """
        # Simulate processing time (2-5 seconds)
        await asyncio.sleep(random.uniform(2, 5))
        
        # Generate mock results based on image type
        findings = AIService._generate_findings(image_type, body_part)
        confidence = round(random.uniform(0.75, 0.95), 2)
        recommendations = AIService._generate_recommendations(findings)
        
        return {
            "status": "completed",
            "confidence_score": confidence,
            "findings": findings,
            "recommendations": recommendations,
            "completed_at": datetime.utcnow()
        }
    
    @staticmethod
    def _generate_findings(image_type: str, body_part: str = None) -> Dict[str, Any]:
        """Generate realistic mock findings based on image type"""
        
        findings_templates = {
            "xray": {
                "chest": [
                    {"name": "Aucune anomalie détectée", "probability": 0.95, "severity": "normal"},
                    {"name": "Pneumonie possible", "probability": 0.72, "location": "Lobe inférieur droit", "severity": "moderate"},
                    {"name": "Cardiomégalie légère", "probability": 0.45, "severity": "mild"},
                ],
                "default": [
                    {"name": "Structure osseuse normale", "probability": 0.88, "severity": "normal"},
                    {"name": "Fracture possible", "probability": 0.15, "severity": "moderate"},
                ]
            },
            "ct": {
                "brain": [
                    {"name": "Aucune anomalie détectée", "probability": 0.92, "severity": "normal"},
                    {"name": "Lésion hypodense mineure", "probability": 0.35, "location": "Lobe frontal", "severity": "mild"},
                ],
                "default": [
                    {"name": "Tissus normaux", "probability": 0.90, "severity": "normal"},
                ]
            },
            "mri": {
                "default": [
                    {"name": "Signal normal", "probability": 0.93, "severity": "normal"},
                    {"name": "Inflammation légère", "probability": 0.28, "severity": "mild"},
                ]
            },
            "retinal": {
                "default": [
                    {"name": "Rétine saine", "probability": 0.89, "severity": "normal"},
                    {"name": "Microanévrismes détectés", "probability": 0.42, "severity": "mild"},
                    {"name": "Rétinopathie diabétique possible", "probability": 0.25, "severity": "moderate"},
                ]
            },
            "ultrasound": {
                "default": [
                    {"name": "Échogénicité normale", "probability": 0.87, "severity": "normal"},
                ]
            }
        }
        
        # Get appropriate template
        type_templates = findings_templates.get(image_type, findings_templates["xray"])
        body_templates = type_templates.get(body_part.lower() if body_part else "default", 
                                           type_templates.get("default", []))
        
        # Randomly select 1-3 findings
        num_findings = random.randint(1, min(3, len(body_templates)))
        selected_findings = random.sample(body_templates, num_findings)
        
        return {
            "pathologies": selected_findings,
            "image_quality": random.choice([
                "Excellente qualité d'image",
                "Bonne exposition, positionnement correct",
                "Qualité acceptable pour diagnostic",
                "Images de haute qualité"
            ]),
            "technical_notes": random.choice([
                "Protocole standard respecté",
                "Acquisition optimale",
                "Paramètres techniques appropriés"
            ])
        }
    
    @staticmethod
    def _generate_recommendations(findings: Dict[str, Any]) -> str:
        """Generate recommendations based on findings"""
        
        pathologies = findings.get("pathologies", [])
        
        # Check severity
        has_moderate = any(p.get("severity") == "moderate" for p in pathologies)
        has_mild = any(p.get("severity") == "mild" for p in pathologies)
        
        recommendations = []
        
        if has_moderate:
            recommendations.append("Consultation spécialisée recommandée")
            recommendations.append("Suivi clinique dans les 7 jours")
        elif has_mild:
            recommendations.append("Surveillance recommandée")
            recommendations.append("Contrôle dans 3-6 mois")
        else:
            recommendations.append("Aucun suivi immédiat nécessaire")
            recommendations.append("Examen de routine annuel")
        
        recommendations.append("Corrélation clinique recommandée")
        
        return " • ".join(recommendations)
