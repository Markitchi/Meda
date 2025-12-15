import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Navigation
            "dashboard": "Dashboard",
            "patients": "Patients",
            "images": "Images",
            "upload": "Upload",
            "account": "Account",
            "profile": "Profile",
            "logout": "Logout",
            "login": "Login",
            "register": "Register",

            // Home Page
            "ai_powered_medical": "AI-Powered Medical",
            "diagnostics_platform": "Diagnostics Platform",
            "hero_description": "Advanced machine learning for accurate medical image analysis and patient care management",
            "get_started": "Get Started",
            "sign_in": "Sign In",
            "go_to_dashboard": "Go to Dashboard",
            "upload_image": "Upload Image",

            // Features
            "ai_analysis": "AI-Powered Analysis",
            "ai_analysis_desc": "Advanced machine learning models for accurate medical image analysis",
            "patient_management": "Patient Management",
            "patient_management_desc": "Comprehensive patient records and medical history tracking",
            "secure_storage": "Secure Storage",
            "secure_storage_desc": "HIPAA-compliant cloud storage for medical images and data",
            "real_time_collaboration": "Real-time Collaboration",
            "real_time_collaboration_desc": "Share cases and collaborate with medical professionals",

            // Stats
            "accuracy_rate": "Accuracy Rate",
            "images_analyzed": "Images Analyzed",
            "healthcare_professionals": "Healthcare Professionals",

            // Dashboard
            "welcome_back": "Welcome Back",
            "your_medical_workspace": "Your medical AI workspace",
            "analyses": "Analyses",
            "pending": "Pending",
            "completed": "Completed",
            "quick_actions": "Quick Actions",
            "new_analysis": "New Analysis",
            "upload_medical_images": "Upload medical images",
            "add_patient": "Add Patient",
            "create_patient_record": "Create patient record",
            "view_images": "View Images",
            "browse_gallery": "Browse gallery",
            "quick_access": "Quick Access",
            "reports": "Reports",

            // Images
            "medical_images_gallery": "Medical Images Gallery",
            "browse_manage_collection": "Browse and manage your medical imaging collection",
            "upload_new": "Upload New",
            "search": "Search",
            "search_placeholder": "Search by filename or body part...",
            "image_type": "Image Type",
            "all_types": "All Types",
            "xray": "X-Ray",
            "ct_scan": "CT Scan",
            "mri": "MRI",
            "retinal": "Retinal",
            "ultrasound": "Ultrasound",
            "other": "Other",
            "total": "Total",
            "displayed": "Displayed",
            "analyzed": "Analyzed",
            "no_images_found": "No images found",
            "download": "Download",
            "delete": "Delete",
            "location": "Location",

            // Patients
            "patient_management_title": "Patient Management",
            "manage_patient_records": "Manage patient records and medical history",
            "new_patient": "New Patient",
            "search_patients": "Search by name, surname, or patient ID...",
            "reset": "Reset",
            "total_patients": "Total Patients",
            "male": "Male",
            "female": "Female",
            "no_patients_found": "No patients found",
            "patient_id": "Patient ID",
            "full_name": "Full Name",
            "age": "Age",
            "gender": "Gender",
            "contact": "Contact",
            "actions": "Actions",
            "view": "View",
            "edit": "Edit",
            "years": "years",

            // Upload
            "upload_medical_image": "Upload Medical Image",
            "upload_analyze_files": "Upload and analyze medical imaging files",
            "drop_file_here": "Drop your file here",
            "or_click_browse": "or click to browse",
            "select_file": "Select File",
            "supported_formats": "Supported: DICOM, PNG, JPEG, TIFF (Max 50MB)",
            "change_file": "Change File",
            "body_part_optional": "Body Part (Optional)",
            "body_part_placeholder": "e.g., Chest, Brain, Knee",
            "uploading": "Uploading...",
            "upload_success": "Upload successful! Redirecting to gallery...",

            // Profile
            "profile_settings": "Profile Settings",
            "manage_account": "Manage your account information and preferences",
            "personal_information": "Personal Information",
            "phone": "Phone",
            "specialty": "Specialty",
            "institution": "Institution",
            "rpps_number": "RPPS Number",
            "save_changes": "Save Changes",
            "saving": "Saving...",
            "change_password": "Change Password",
            "current_password": "Current Password",
            "new_password": "New Password",
            "confirm_new_password": "Confirm New Password",
            "changing": "Changing...",
            "member_since": "Member since",

            // Auth
            "welcome_back_login": "Welcome Back",
            "sign_in_account": "Sign in to your Meda account",
            "email": "Email",
            "password": "Password",
            "signing_in": "Signing in...",
            "sign_in_btn": "Sign In",
            "no_account": "Don't have an account?",
            "sign_up": "Sign up",
            "create_account": "Create Account",
            "join_meda": "Join Meda today",
            "professional_email": "Professional Email",
            "role": "Role",
            "doctor": "Doctor",
            "radiologist": "Radiologist",
            "nurse": "Nurse",
            "minimum_8_characters": "Minimum 8 characters",
            "confirm_password": "Confirm Password",
            "creating_account": "Creating account...",
            "already_have_account": "Already have an account?",

            // Common
            "loading": "Loading...",
            "error": "Error",
            "success": "Success",
        }
    },
    fr: {
        translation: {
            // Navigation
            "dashboard": "Tableau de Bord",
            "patients": "Patients",
            "images": "Images",
            "upload": "Téléverser",
            "account": "Compte",
            "profile": "Profil",
            "logout": "Déconnexion",
            "login": "Connexion",
            "register": "Inscription",

            // Home Page
            "ai_powered_medical": "Diagnostic Médical",
            "diagnostics_platform": "Assisté par IA",
            "hero_description": "Apprentissage automatique avancé pour l'analyse précise d'images médicales et la gestion des soins",
            "get_started": "Commencer",
            "sign_in": "Se Connecter",
            "go_to_dashboard": "Tableau de Bord",
            "upload_image": "Téléverser Image",

            // Features
            "ai_analysis": "Analyse par IA",
            "ai_analysis_desc": "Modèles d'apprentissage automatique avancés pour une analyse précise des images médicales",
            "patient_management": "Gestion des Patients",
            "patient_management_desc": "Dossiers patients complets et suivi de l'historique médical",
            "secure_storage": "Stockage Sécurisé",
            "secure_storage_desc": "Stockage cloud conforme HIPAA pour images et données médicales",
            "real_time_collaboration": "Collaboration Temps Réel",
            "real_time_collaboration_desc": "Partagez des cas et collaborez avec des professionnels de santé",

            // Stats
            "accuracy_rate": "Taux de Précision",
            "images_analyzed": "Images Analysées",
            "healthcare_professionals": "Professionnels de Santé",

            // Dashboard
            "welcome_back": "Bon Retour",
            "your_medical_workspace": "Votre espace de travail médical IA",
            "analyses": "Analyses",
            "pending": "En Attente",
            "completed": "Complétées",
            "quick_actions": "Actions Rapides",
            "new_analysis": "Nouvelle Analyse",
            "upload_medical_images": "Téléverser images médicales",
            "add_patient": "Ajouter Patient",
            "create_patient_record": "Créer dossier patient",
            "view_images": "Voir Images",
            "browse_gallery": "Parcourir galerie",
            "quick_access": "Accès Rapide",
            "reports": "Rapports",

            // Images
            "medical_images_gallery": "Galerie d'Images Médicales",
            "browse_manage_collection": "Parcourir et gérer votre collection d'imagerie médicale",
            "upload_new": "Téléverser",
            "search": "Rechercher",
            "search_placeholder": "Rechercher par nom de fichier ou partie du corps...",
            "image_type": "Type d'Image",
            "all_types": "Tous Types",
            "xray": "Radiographie",
            "ct_scan": "Scanner",
            "mri": "IRM",
            "retinal": "Rétinien",
            "ultrasound": "Échographie",
            "other": "Autre",
            "total": "Total",
            "displayed": "Affichées",
            "analyzed": "Analysées",
            "no_images_found": "Aucune image trouvée",
            "download": "Télécharger",
            "delete": "Supprimer",
            "location": "Localisation",

            // Patients
            "patient_management_title": "Gestion des Patients",
            "manage_patient_records": "Gérer les dossiers patients et l'historique médical",
            "new_patient": "Nouveau Patient",
            "search_patients": "Rechercher par nom, prénom ou ID patient...",
            "reset": "Réinitialiser",
            "total_patients": "Total Patients",
            "male": "Hommes",
            "female": "Femmes",
            "no_patients_found": "Aucun patient trouvé",
            "patient_id": "ID Patient",
            "full_name": "Nom Complet",
            "age": "Âge",
            "gender": "Genre",
            "contact": "Contact",
            "actions": "Actions",
            "view": "Voir",
            "edit": "Modifier",
            "years": "ans",

            // Upload
            "upload_medical_image": "Téléverser Image Médicale",
            "upload_analyze_files": "Téléverser et analyser des fichiers d'imagerie médicale",
            "drop_file_here": "Déposez votre fichier ici",
            "or_click_browse": "ou cliquez pour parcourir",
            "select_file": "Sélectionner Fichier",
            "supported_formats": "Supportés: DICOM, PNG, JPEG, TIFF (Max 50MB)",
            "change_file": "Changer Fichier",
            "body_part_optional": "Partie du Corps (Optionnel)",
            "body_part_placeholder": "ex: Thorax, Cerveau, Genou",
            "uploading": "Téléversement...",
            "upload_success": "Téléversement réussi! Redirection vers la galerie...",

            // Profile
            "profile_settings": "Paramètres du Profil",
            "manage_account": "Gérer vos informations de compte et préférences",
            "personal_information": "Informations Personnelles",
            "phone": "Téléphone",
            "specialty": "Spécialité",
            "institution": "Institution",
            "rpps_number": "Numéro RPPS",
            "save_changes": "Enregistrer",
            "saving": "Enregistrement...",
            "change_password": "Changer Mot de Passe",
            "current_password": "Mot de Passe Actuel",
            "new_password": "Nouveau Mot de Passe",
            "confirm_new_password": "Confirmer Nouveau Mot de Passe",
            "changing": "Changement...",
            "member_since": "Membre depuis",

            // Auth
            "welcome_back_login": "Bon Retour",
            "sign_in_account": "Connectez-vous à votre compte Meda",
            "email": "Email",
            "password": "Mot de Passe",
            "signing_in": "Connexion...",
            "sign_in_btn": "Se Connecter",
            "no_account": "Pas de compte?",
            "sign_up": "S'inscrire",
            "create_account": "Créer un Compte",
            "join_meda": "Rejoignez Meda aujourd'hui",
            "professional_email": "Email Professionnel",
            "role": "Rôle",
            "doctor": "Médecin",
            "radiologist": "Radiologue",
            "nurse": "Infirmier(ère)",
            "minimum_8_characters": "Minimum 8 caractères",
            "confirm_password": "Confirmer Mot de Passe",
            "creating_account": "Création du compte...",
            "already_have_account": "Déjà un compte?",

            // Common
            "loading": "Chargement...",
            "error": "Erreur",
            "success": "Succès",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
