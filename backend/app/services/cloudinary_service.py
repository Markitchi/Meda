import cloudinary
import cloudinary.uploader
from typing import BinaryIO
import os

class CloudinaryService:
    """Service pour gérer le stockage d'images sur Cloudinary (gratuit)"""
    
    def __init__(self):
        cloudinary.config(
            cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key=os.getenv("CLOUDINARY_API_KEY"),
            api_secret=os.getenv("CLOUDINARY_API_SECRET"),
            secure=True
        )
    
    def upload_file(self, file: BinaryIO, public_id: str, content_type: str = None, file_size: int = None) -> str:
        """
        Upload un fichier vers Cloudinary
        
        Args:
            file: Fichier binaire à uploader
            public_id: Identifiant unique du fichier
            content_type: Type MIME (optionnel)
            file_size: Taille du fichier (optionnel)
        
        Returns:
            URL sécurisée du fichier uploadé
        """
        try:
            result = cloudinary.uploader.upload(
                file,
                public_id=public_id,
                folder="meda_medical_images",
                resource_type="auto",
                overwrite=False,
                unique_filename=True
            )
            return result['secure_url']
        except Exception as e:
            raise Exception(f"Erreur upload Cloudinary: {str(e)}")
    
    def delete_file(self, public_id: str):
        """
        Supprime un fichier de Cloudinary
        
        Args:
            public_id: Identifiant du fichier à supprimer
        """
        try:
            # Extraire le public_id de l'URL si nécessaire
            if public_id.startswith('http'):
                # Format: https://res.cloudinary.com/cloud/image/upload/v123/folder/file.jpg
                parts = public_id.split('/')
                # Prendre folder/file sans extension
                public_id = '/'.join(parts[-2:]).rsplit('.', 1)[0]
            
            cloudinary.uploader.destroy(public_id, invalidate=True)
        except Exception as e:
            print(f"Avertissement: Échec suppression Cloudinary: {e}")
    
    def get_file_url(self, public_id: str, expires_in: int = 3600) -> str:
        """
        Génère une URL pour accéder au fichier
        
        Args:
            public_id: Identifiant du fichier
            expires_in: Durée de validité en secondes (ignoré pour Cloudinary)
        
        Returns:
            URL du fichier
        """
        if public_id.startswith('http'):
            return public_id
        
        return cloudinary.CloudinaryImage(public_id).build_url(secure=True)

# Instance globale
cloudinary_service = CloudinaryService()
