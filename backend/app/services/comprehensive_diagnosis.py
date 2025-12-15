from typing import List, Dict, Any
from datetime import datetime
from app.models.medical import MedicalImage
from app.models.consultation import MedicalHistory
from app.services.ai_service import AIService


class ComprehensiveDiagnosisService:
    """Service de diagnostic médical complet basé sur plusieurs sources de données"""
    
    @staticmethod
    async def diagnose_patient(
        symptoms: List[str],
        vital_signs: Dict[str, Any],
        medical_history: List[MedicalHistory],
        images: List[MedicalImage]
    ) -> Dict[str, Any]:
        """
        Diagnostic complet d'un patient basé sur:
        - Symptômes actuels
        - Signes vitaux
        - Antécédents médicaux
        - Images médicales
        
        Returns:
            Dict contenant le diagnostic, la confiance, et les recommandations
        """
        
        # 1. Analyser les images médicales
        image_findings = []
        if images:
            for image in images:
                analysis = await AIService.analyze_image(
                    image.image_type.value,
                    image.body_part
                )
                image_findings.append({
                    "image_type": image.image_type.value,
                    "body_part": image.body_part,
                    "findings": analysis["findings"],
                    "confidence": analysis["confidence_score"]
                })
        
        # 2. Analyser les symptômes
        symptom_analysis = ComprehensiveDiagnosisService._analyze_symptoms(symptoms)
        
        # 3. Considérer les antécédents médicaux
        risk_factors = ComprehensiveDiagnosisService._assess_risk_factors(medical_history)
        
        # 4. Analyser les signes vitaux
        vital_signs_assessment = ComprehensiveDiagnosisService._assess_vital_signs(vital_signs)
        
        # 5. Générer le diagnostic synthétique
        diagnosis = ComprehensiveDiagnosisService._generate_diagnosis(
            symptom_analysis,
            image_findings,
            risk_factors,
            vital_signs_assessment
        )
        
        return {
            "diagnosis": diagnosis["primary_diagnosis"],
            "differential_diagnoses": diagnosis["differential"],
            "confidence_score": diagnosis["confidence"],
            "findings": {
                "symptoms": symptom_analysis,
                "images": image_findings,
                "vital_signs": vital_signs_assessment,
                "risk_factors": risk_factors
            },
            "recommendations": diagnosis["recommendations"],
            "urgency_level": diagnosis["urgency"],
            "suggested_tests": diagnosis["suggested_tests"],
            "generated_at": datetime.utcnow()
        }
    
    @staticmethod
    def _analyze_symptoms(symptoms: List[str]) -> Dict[str, Any]:
        """Analyse des symptômes déclarés"""
        
        # Mapping symptômes -> conditions possibles (simplifié)
        symptom_conditions = {
            "fièvre": ["infection", "inflammation"],
            "toux": ["infection respiratoire", "allergie"],
            "douleur thoracique": ["problème cardiaque", "problème pulmonaire"],
            "essoufflement": ["problème cardiaque", "problème pulmonaire"],
            "maux de tête": ["migraine", "tension", "hypertension"],
            "fatigue": ["anémie", "infection", "stress"],
            "nausée": ["problème digestif", "infection"],
        }
        
        possible_conditions = set()
        for symptom in symptoms:
            symptom_lower = symptom.lower()
            for key, conditions in symptom_conditions.items():
                if key in symptom_lower:
                    possible_conditions.update(conditions)
        
        return {
            "reported_symptoms": symptoms,
            "possible_conditions": list(possible_conditions),
            "severity": "moderate" if len(symptoms) > 3 else "mild"
        }
    
    @staticmethod
    def _assess_risk_factors(medical_history: List[MedicalHistory]) -> Dict[str, Any]:
        """Évaluation des facteurs de risque basés sur les antécédents"""
        
        active_conditions = [h.condition for h in medical_history if h.status == "active"]
        chronic_conditions = [h.condition for h in medical_history if h.status == "chronic"]
        
        # Facteurs de risque communs
        high_risk_conditions = ["diabète", "hypertension", "maladie cardiaque", "cancer"]
        
        risk_level = "low"
        if any(cond.lower() in " ".join(active_conditions + chronic_conditions).lower() 
               for cond in high_risk_conditions):
            risk_level = "high"
        elif len(active_conditions) > 2:
            risk_level = "moderate"
        
        return {
            "active_conditions": active_conditions,
            "chronic_conditions": chronic_conditions,
            "risk_level": risk_level,
            "requires_special_attention": risk_level == "high"
        }
    
    @staticmethod
    def _assess_vital_signs(vital_signs: Dict[str, Any]) -> Dict[str, Any]:
        """Évaluation des signes vitaux"""
        
        alerts = []
        
        # Température
        if vital_signs.get("temperature"):
            temp = vital_signs["temperature"]
            if temp > 38.5:
                alerts.append("Fièvre élevée détectée")
            elif temp < 36.0:
                alerts.append("Hypothermie détectée")
        
        # Fréquence cardiaque
        if vital_signs.get("heart_rate"):
            hr = vital_signs["heart_rate"]
            if hr > 100:
                alerts.append("Tachycardie détectée")
            elif hr < 60:
                alerts.append("Bradycardie détectée")
        
        # Saturation en oxygène
        if vital_signs.get("oxygen_saturation"):
            spo2 = vital_signs["oxygen_saturation"]
            if spo2 < 95:
                alerts.append("Saturation en oxygène basse")
        
        return {
            "vital_signs": vital_signs,
            "alerts": alerts,
            "status": "critical" if len(alerts) > 2 else "normal" if len(alerts) == 0 else "warning"
        }
    
    @staticmethod
    def _generate_diagnosis(
        symptom_analysis: Dict,
        image_findings: List[Dict],
        risk_factors: Dict,
        vital_signs_assessment: Dict
    ) -> Dict[str, Any]:
        """Génère le diagnostic final en combinant toutes les sources"""
        
        # Diagnostic principal basé sur les symptômes et images
        primary_diagnosis = "Évaluation clinique complète nécessaire"
        differential = []
        confidence = 0.65
        urgency = "routine"
        detailed_findings = []
        
        # Analyser les images en détail
        if image_findings:
            for finding in image_findings:
                image_type = finding["image_type"]
                body_part = finding["body_part"] or "non spécifié"
                
                if finding["findings"].get("pathologies"):
                    for pathology in finding["findings"]["pathologies"]:
                        prob = pathology.get("probability", 0)
                        if prob > 0.5:
                            differential.append(f"{pathology['name']} ({int(prob*100)}% de probabilité)")
                            
                            # Ajouter des détails spécifiques selon le type d'image
                            if image_type == "retinal":
                                detailed_findings.append(
                                    f"• Rétine ({body_part}): {pathology['name']} détecté avec {int(prob*100)}% de confiance. "
                                    f"Zones affectées: {pathology.get('location', 'multiples zones')}. "
                                    f"Sévérité estimée: {pathology.get('severity', 'modérée')}."
                                )
                            elif image_type == "xray":
                                detailed_findings.append(
                                    f"• Radiographie ({body_part}): Anomalie détectée - {pathology['name']}. "
                                    f"Localisation: {pathology.get('location', 'zone centrale')}. "
                                    f"Densité: {pathology.get('density', 'normale à augmentée')}. "
                                    f"Taille estimée: {pathology.get('size', '< 2cm')}."
                                )
                            elif image_type == "ct":
                                detailed_findings.append(
                                    f"• Scanner ({body_part}): {pathology['name']} identifié. "
                                    f"Dimensions: {pathology.get('dimensions', 'non mesurées')}. "
                                    f"Densité Hounsfield: {pathology.get('hu_value', 'non calculée')}. "
                                    f"Extension: {pathology.get('extent', 'localisée')}."
                                )
                            else:
                                detailed_findings.append(
                                    f"• {image_type.upper()} ({body_part}): {pathology['name']} observé. "
                                    f"Caractéristiques: {pathology.get('characteristics', 'à préciser')}."
                                )
                            
                            confidence = max(confidence, prob)
        
        # Analyser les symptômes en détail
        if symptom_analysis["reported_symptoms"]:
            symptom_details = []
            for symptom in symptom_analysis["reported_symptoms"]:
                symptom_lower = symptom.lower()
                
                # Détails spécifiques par symptôme
                if "douleur" in symptom_lower:
                    if "thoracique" in symptom_lower or "poitrine" in symptom_lower:
                        differential.extend([
                            "Angine de poitrine (angor)",
                            "Infarctus du myocarde (à exclure)",
                            "Péricardite",
                            "Embolie pulmonaire",
                            "Reflux gastro-œsophagien"
                        ])
                        symptom_details.append(
                            "• Douleur thoracique: Nécessite évaluation cardiaque urgente. "
                            "Caractériser: intensité (0-10), irradiation, facteurs déclenchants, durée."
                        )
                        urgency = "urgent"
                    elif "abdominale" in symptom_lower:
                        differential.extend([
                            "Gastrite/Ulcère gastrique",
                            "Appendicite (si douleur FID)",
                            "Cholécystite",
                            "Pancréatite"
                        ])
                        symptom_details.append(
                            "• Douleur abdominale: Localisation précise nécessaire. "
                            "Signes associés: défense, rebond, Murphy, McBurney à vérifier."
                        )
                elif "fièvre" in symptom_lower:
                    differential.extend([
                        "Infection bactérienne (à documenter)",
                        "Infection virale",
                        "Processus inflammatoire"
                    ])
                    symptom_details.append(
                        "• Fièvre: Température exacte, courbe thermique, frissons, sueurs nocturnes à documenter. "
                        "Foyer infectieux à rechercher (ORL, pulmonaire, urinaire, cutané)."
                    )
                elif "essoufflement" in symptom_lower or "dyspnée" in symptom_lower:
                    differential.extend([
                        "Insuffisance cardiaque congestive",
                        "Asthme/BPCO",
                        "Pneumonie",
                        "Anémie sévère"
                    ])
                    symptom_details.append(
                        "• Dyspnée: Classifier selon NYHA ou mMRC. "
                        "Orthopnée, DPN, œdèmes des membres inférieurs à rechercher. "
                        "SpO2 et gaz du sang si < 92%."
                    )
                elif "toux" in symptom_lower:
                    differential.extend([
                        "Bronchite aiguë",
                        "Pneumonie communautaire",
                        "Tuberculose (si chronique)",
                        "Insuffisance cardiaque gauche"
                    ])
                    symptom_details.append(
                        "• Toux: Caractériser - sèche/productive, expectorations (aspect, volume), "
                        "hémoptysie, durée. Auscultation pulmonaire détaillée nécessaire."
                    )
            
            detailed_findings.extend(symptom_details)
        
        # Analyser les signes vitaux en détail
        if vital_signs_assessment["alerts"]:
            for alert in vital_signs_assessment["alerts"]:
                if "Fièvre" in alert:
                    temp = vital_signs_assessment["vital_signs"].get("temperature", 0)
                    detailed_findings.append(
                        f"• Hyperthermie: {temp}°C. "
                        f"{'Fièvre modérée (38-39°C)' if temp < 39 else 'Fièvre élevée (>39°C) - antipyrétiques et hémocultures recommandés'}."
                    )
                    urgency = "priority" if temp > 39 else urgency
                elif "Tachycardie" in alert:
                    hr = vital_signs_assessment["vital_signs"].get("heart_rate", 0)
                    detailed_findings.append(
                        f"• Tachycardie: {hr} bpm. "
                        f"Causes à explorer: fièvre, déshydratation, anémie, hyperthyroïdie, anxiété, arythmie. "
                        f"ECG recommandé."
                    )
                elif "Saturation" in alert:
                    spo2 = vital_signs_assessment["vital_signs"].get("oxygen_saturation", 0)
                    detailed_findings.append(
                        f"• Hypoxémie: SpO2 {spo2}%. "
                        f"{'Oxygénothérapie immédiate si < 90%' if spo2 < 90 else 'Surveillance rapprochée'}. "
                        f"Gaz du sang artériel recommandés."
                    )
                    urgency = "urgent" if spo2 < 90 else "priority"
        
        # Ajuster selon les facteurs de risque
        if risk_factors["risk_level"] == "high":
            urgency = "priority" if urgency == "routine" else urgency
            differential.append("Complications liées aux comorbidités")
            detailed_findings.append(
                f"• Terrain à risque: Antécédents de {', '.join(risk_factors['active_conditions'][:3])}. "
                f"Surveillance renforcée et adaptation thérapeutique nécessaires."
            )
        
        # Générer le diagnostic principal plus spécifique
        if differential:
            top_diagnosis = differential[0] if differential else "Syndrome clinique non spécifique"
            primary_diagnosis = f"Suspicion de {top_diagnosis}"
        
        # Recommandations détaillées
        recommendations = []
        if urgency == "urgent":
            recommendations.extend([
                "[URGENCE] Consultation médicale IMMÉDIATE (< 2h)",
                "Surveillance continue des constantes vitales",
                "Accès veineux et bilan biologique en urgence"
            ])
        elif urgency == "priority":
            recommendations.extend([
                "[PRIORITAIRE] Consultation médicale dans les 24-48h",
                "Surveillance régulière des symptômes",
                "Repos et hydratation"
            ])
        else:
            recommendations.extend([
                "[ROUTINE] Suivi médical de routine dans les 7-14 jours",
                "Surveillance de l'évolution des symptômes",
                "Mesures hygiéno-diététiques"
            ])
        
        if risk_factors["requires_special_attention"]:
            recommendations.append(
                "[IMPORTANT] Coordination avec médecin traitant pour gestion des comorbidités"
            )
        
        # Tests suggérés détaillés
        suggested_tests = []
        differential_str = " ".join(differential).lower()
        
        if "infection" in differential_str or "fièvre" in differential_str:
            suggested_tests.extend([
                "NFS avec formule leucocytaire",
                "CRP, VS",
                "Hémocultures si fièvre > 38.5°C",
                "ECBU si suspicion urinaire"
            ])
        if "cardiaque" in differential_str or "thoracique" in differential_str:
            suggested_tests.extend([
                "ECG 12 dérivations",
                "Troponine Ic (si douleur thoracique)",
                "BNP/NT-proBNP (si dyspnée)",
                "Échocardiographie transthoracique",
                "Radiographie thoracique"
            ])
        if "pulmonaire" in differential_str or "toux" in differential_str:
            suggested_tests.extend([
                "Radiographie thoracique (face + profil)",
                "Gaz du sang artériel si SpO2 < 92%",
                "Spirométrie si BPCO suspecté"
            ])
        if vital_signs_assessment["alerts"]:
            suggested_tests.append("Surveillance continue: TA, FC, FR, SpO2, T°C toutes les 4h")
        
        # Ajouter les détails des findings au diagnostic
        if detailed_findings:
            primary_diagnosis += f"\n\nDétails cliniques:\n" + "\n".join(detailed_findings)
        
        return {
            "primary_diagnosis": primary_diagnosis,
            "differential": list(set(differential))[:7],  # Top 7 diagnostics différentiels
            "confidence": min(confidence, 0.92),
            "urgency": urgency,
            "recommendations": recommendations,
            "suggested_tests": list(set(suggested_tests))  # Dédupliquer
        }

