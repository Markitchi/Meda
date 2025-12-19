"""
Script pour initialiser la base de données Render depuis local
"""
import os
import sys

# Remplacez par votre External Database URL de Render
RENDER_DB_URL = "postgresql://meda_user:ybligYZsouMvu5BjQw9MjRA8hAhUXVQ3@dpg-d4vu5bm3jp1c73et3tpg-a.virginia-postgres.render.com/meda_prod?sslmode=require"

# Sauvegarder l'ancienne DATABASE_URL
old_db_url = os.environ.get('DATABASE_URL')

# Utiliser temporairement la DB Render
os.environ['DATABASE_URL'] = RENDER_DB_URL

try:
    # Importer après avoir défini DATABASE_URL
    from app.core.database import engine, Base
    from app.models.user import User
    from app.models.medical import MedicalImage, Patient
    from app.models.analysis import Analysis
    from app.models.consultation import Consultation, MedicalHistory
    
    print("🔄 Création des tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès!")
    print("✅ Base de données Render initialisée!")
    
except Exception as e:
    print(f"❌ Erreur: {e}")
    sys.exit(1)
    
finally:
    # Restaurer l'ancienne DATABASE_URL
    if old_db_url:
        os.environ['DATABASE_URL'] = old_db_url
