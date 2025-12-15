# Guide de Déploiement Render.com - 100% Gratuit

## Étape 1: Créer Comptes (5 min)

### 1.1 Compte Render.com
1. Aller sur https://render.com
2. **Sign Up** avec GitHub
3. Autoriser accès au repository Meda
4. ✅ Aucune carte bancaire requise!

### 1.2 Compte Cloudinary
1. Aller sur https://cloudinary.com
2. **Sign Up** (gratuit)
3. Dashboard → **Settings** → **Access Keys**
4. Copier:
   - **Cloud Name**: `dxxxxx`
   - **API Key**: `123456789`
   - **API Secret**: `abcdefghijk`

---

## Étape 2: Push Code sur GitHub

```bash
cd c:\Users\nenfa\OneDrive\Documents\Meda

# Ajouter tous les changements
git add .
git commit -m "Configure for Render deployment with Cloudinary"
git push origin main
```

---

## Étape 3: Créer PostgreSQL Database

1. Dashboard Render → **New** → **PostgreSQL**
2. Configuration:
   - Name: `meda-db`
   - Database: `meda_prod`
   - User: `meda_user`
   - Region: **Frankfurt** (Europe)
   - Plan: **Free**
3. **Create Database**
4. ⏳ Attendre 2-3 minutes
5. Copier **Internal Database URL**:
   ```
   postgresql://meda_user:xxxxx@dpg-xxxxx-a.frankfurt-postgres.render.com/meda_prod
   ```

---

## Étape 4: Créer Backend Web Service

1. Dashboard → **New** → **Web Service**
2. **Connect repository**: Sélectionner votre repo `meda`
3. Configuration:
   - **Name**: `meda-backend`
   - **Region**: Frankfurt
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT
     ```
   - **Plan**: Free

4. **Environment Variables** (Add):
   ```
   DATABASE_URL=<COLLER_INTERNAL_DATABASE_URL>
   JWT_SECRET_KEY=<GENERER_AVEC_openssl_rand_-hex_32>
   CLOUDINARY_CLOUD_NAME=<VOTRE_CLOUD_NAME>
   CLOUDINARY_API_KEY=<VOTRE_API_KEY>
   CLOUDINARY_API_SECRET=<VOTRE_API_SECRET>
   ENVIRONMENT=production
   PYTHON_VERSION=3.11.0
   ```

5. **Create Web Service**
6. ⏳ Attendre déploiement (~5 min)
7. URL: `https://meda-backend.onrender.com`

---

## Étape 5: Créer Frontend Web Service

1. Dashboard → **New** → **Web Service**
2. **Connect repository**: Même repo `meda`
3. Configuration:
   - **Name**: `meda-frontend`
   - **Region**: Frankfurt
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free

4. **Environment Variables** (Add):
   ```
   NEXT_PUBLIC_API_URL=https://meda-backend.onrender.com/api
   NODE_VERSION=18.17.0
   ```

5. **Create Web Service**
6. ⏳ Attendre déploiement (~7 min)
7. URL: `https://meda-frontend.onrender.com`

---

## Étape 6: Initialiser Base de Données

### Option A: Via Render Shell (Recommandé)

1. Service Backend → **Shell**
2. Exécuter:
```python
python -c "
from app.core.database import engine, Base
from app.models.user import User
from app.models.medical import MedicalImage, Patient
from app.models.analysis import Analysis
from app.models.consultation import Consultation, MedicalHistory
Base.metadata.create_all(bind=engine)
print('✅ Tables créées!')
"
```

### Option B: Via Local (Alternative)

1. Copier External Database URL de Render
2. Modifier `.env` local temporairement:
   ```
   DATABASE_URL=<EXTERNAL_DATABASE_URL>
   ```
3. Exécuter script Python ci-dessus
4. Restaurer `.env`

---

## Étape 7: Tester l'Application

### URLs
- **Frontend**: https://meda-frontend.onrender.com
- **Backend API**: https://meda-backend.onrender.com
- **API Docs**: https://meda-backend.onrender.com/docs

### Tests
1. ✅ Ouvrir frontend
2. ✅ S'inscrire
3. ✅ Se connecter
4. ✅ Créer un patient
5. ✅ Upload une image
6. ✅ Créer une consultation
7. ✅ Vérifier diagnostic IA

---

## Étape 8: Empêcher le Sleep (Optionnel)

Les services gratuits s'endorment après 15 min d'inactivité.

### Solution: UptimeRobot (Gratuit)

1. https://uptimerobot.com → Sign Up
2. **Add New Monitor**:
   - Type: HTTP(s)
   - Friendly Name: Meda Frontend
   - URL: `https://meda-frontend.onrender.com`
   - Monitoring Interval: **5 minutes**
3. **Create Monitor**
4. Répéter pour backend: `https://meda-backend.onrender.com`

✅ Vos services resteront actifs 24/7!

---

## Mises à Jour Futures

### Déploiement Automatique

Render redéploie automatiquement à chaque `git push`:

```bash
# Faire des modifications
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main

# Render redéploie automatiquement! 🚀
```

### Voir les Logs

1. Dashboard Render → Service → **Logs**
2. Logs en temps réel
3. Filtrer par erreurs

---

## Coûts

### 100% Gratuit Permanent ✅
- **Render PostgreSQL**: Gratuit (256MB)
- **Render Backend**: Gratuit (750h/mois)
- **Render Frontend**: Gratuit (750h/mois)
- **Cloudinary**: Gratuit (25GB stockage)
- **UptimeRobot**: Gratuit (50 monitors)
- **Total**: **0€/mois**

### Limitations
- Services s'endorment après 15 min (résolu avec UptimeRobot)
- 256MB PostgreSQL (suffisant pour démarrer)
- 25GB images (largement suffisant)

---

## Dépannage

### Service ne démarre pas
```bash
# Vérifier logs
Dashboard → Service → Logs

# Erreurs communes:
# - Variables d'environnement manquantes
# - DATABASE_URL incorrect
# - Cloudinary credentials invalides
```

### Base de données inaccessible
```bash
# Vérifier DATABASE_URL
# Format: postgresql://user:pass@host/db
```

### Images ne s'uploadent pas
```bash
# Vérifier Cloudinary credentials
# Tester sur cloudinary.com/console
```

---

## Support

- **Render Docs**: https://render.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Render Community**: https://community.render.com

---

## Temps Total Estimé

- ✅ Créer comptes: 5 min
- ✅ Push code: 2 min
- ✅ Créer PostgreSQL: 3 min
- ✅ Créer Backend: 7 min
- ✅ Créer Frontend: 7 min
- ✅ Init DB: 2 min
- ✅ Tests: 5 min
- **Total: ~30 minutes**

---

## Prochaines Étapes

1. ✅ Créer compte Render
2. ✅ Créer compte Cloudinary
3. ✅ Push code sur GitHub
4. ✅ Suivre étapes 3-7
5. ✅ Profiter de votre app en production!

**Bonne chance! 🚀**
