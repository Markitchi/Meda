from azure.storage.blob import BlobServiceClient, ContentSettings, generate_blob_sas, BlobSasPermissions
from typing import BinaryIO
import os
from datetime import datetime, timedelta

class AzureBlobService:
    """Service pour gérer le stockage d'images sur Azure Blob Storage"""
    
    def __init__(self):
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_name = "medical-images"
        self.account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
        self.account_key = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
        
        # Créer conteneur s'il n'existe pas
        try:
            self.blob_service_client.create_container(self.container_name)
        except:
            pass  # Conteneur existe déjà
    
    def upload_file(self, file: BinaryIO, blob_name: str, content_type: str = None, file_size: int = None) -> str:
        """
        Upload un fichier vers Azure Blob Storage
        
        Args:
            file: Fichier binaire à uploader
            blob_name: Nom du blob (chemin dans le conteneur)
            content_type: Type MIME
            file_size: Taille du fichier (optionnel)
        
        Returns:
            Nom du blob (à stocker en DB)
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            content_settings = ContentSettings(content_type=content_type) if content_type else None
            
            blob_client.upload_blob(
                file,
                content_settings=content_settings,
                overwrite=True
            )
            
            # Retourner le nom du blob (pas l'URL complète)
            return blob_name
        except Exception as e:
            raise Exception(f"Erreur upload Azure Blob: {str(e)}")
    
    def delete_file(self, blob_name: str):
        """
        Supprime un fichier d'Azure Blob Storage
        
        Args:
            blob_name: Nom du blob à supprimer
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            blob_client.delete_blob()
            print(f"✅ Blob supprimé: {blob_name}")
        except Exception as e:
            print(f"⚠️ Avertissement: Échec suppression blob: {e}")
    
    def get_file_url(self, blob_name: str, expires_in: int = 3600) -> str:
        """
        Génère une URL SAS (Shared Access Signature) avec expiration
        
        Args:
            blob_name: Nom du blob
            expires_in: Durée de validité en secondes (défaut: 1h)
        
        Returns:
            URL signée avec token SAS
        """
        try:
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                container_name=self.container_name,
                blob_name=blob_name,
                account_key=self.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(seconds=expires_in)
            )
            
            return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
        except Exception as e:
            raise Exception(f"Erreur génération URL SAS: {str(e)}")

# Instance globale
azure_blob_service = AzureBlobService()
