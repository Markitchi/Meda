# 🚀 Getting Started with Meda

This guide will help you set up and run Meda on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js** 18+ ([Download](https://nodejs.org/))
- ✅ **Python** 3.11+ ([Download](https://www.python.org/))
- ✅ **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))
- ✅ **Git** ([Download](https://git-scm.com/))

### Optional (for Docker setup)
- 🐳 **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))

## 📥 Installation

### Option 1: Local Development Setup (Recommended for Development)

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd meda
```

#### Step 2: Set Up Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` and configure your settings:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/meda

# JWT Secret (generate a secure random string)
SECRET_KEY=your-secret-key-here

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Step 3: Set Up the Backend

1. Navigate to the backend folder:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - **Windows**: `.\venv\Scripts\activate`
   - **Linux/Mac**: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create the database tables:
```bash
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

6. Start the backend server:
```bash
python -m uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

#### Step 4: Set Up the Frontend

1. Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```bash
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Option 2: Docker Setup (Recommended for Production)

1. Make sure Docker Desktop is running

2. Start all services with Docker Compose:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- MinIO object storage
- Backend API
- Frontend application

Access the application at `http://localhost:3000`

## 🎯 First Steps

### 1. Create Your First Account

1. Navigate to `http://localhost:3000`
2. Click **"S'inscrire"** (Register)
3. Fill in your details:
   - Full name
   - Email
   - Password (minimum 8 characters)
4. Click **"Créer un compte"**

### 2. Set Up Two-Factor Authentication (2FA)

1. After registration, you'll be prompted to set up 2FA
2. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
3. Enter the 6-digit code to verify

### 3. Explore the Dashboard

Once logged in, you'll see the main dashboard with:
- **Statistics**: Overview of patients, images, and consultations
- **Recent Activity**: Latest actions and updates
- **Quick Actions**: Shortcuts to common tasks

### 4. Create Your First Patient

1. Click **"Patients"** in the navigation menu
2. Click **"Nouveau Patient"** (New Patient)
3. Fill in patient information:
   - Name, date of birth, gender
   - Contact information
   - Medical history
4. Click **"Créer"** (Create)

### 5. Upload a Medical Image

1. Go to **"Images"** in the navigation menu
2. Click **"Upload"** or drag and drop an image
3. Select the patient
4. Add a description
5. Click **"Upload"**

### 6. Generate an AI Diagnosis

1. Navigate to a patient's consultation
2. Fill in symptoms and vital signs
3. Click **"Générer Diagnostic IA"** (Generate AI Diagnosis)
4. Review the comprehensive diagnosis with:
   - Primary diagnosis
   - Differential diagnoses
   - Recommended tests
   - Priority level

## 🛠️ Useful Scripts

We've included several utility scripts in the `scripts/` folder:

- **`start-backend.ps1`** - Start the backend server
- **`start-frontend.bat`** - Start the frontend server
- **`install-backend.ps1`** - Install backend dependencies

## 🔧 Troubleshooting

### Backend won't start

**Problem**: `ModuleNotFoundError` or import errors

**Solution**: Make sure you've activated the virtual environment and installed all dependencies:
```bash
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Database connection error

**Problem**: `could not connect to server: Connection refused`

**Solution**: Ensure PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.

### Frontend build errors

**Problem**: `Module not found` errors

**Solution**: Delete `node_modules` and reinstall:
```bash
cd frontend
rm -rf node_modules
npm install
```

### Port already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Kill the process using the port or use a different port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📚 Next Steps

- **[Watch the Demo Video](demo/Meda_demo.mp4)** - See all features in action
- **[Explore Features](FEATURES.md)** - Learn about all available features
- **[Read the Architecture Guide](ARCHITECTURE.md)** - Understand the system design
- **[API Documentation](API_REFERENCE.md)** - Integrate with the API

## 💡 Tips

1. **Use the API Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation
2. **Enable Dark Mode**: Toggle the theme in the top-right corner
3. **Keyboard Shortcuts**: Press `?` to see available shortcuts
4. **Sample Data**: Use the demo video as a guide for creating realistic test data

## 🆘 Need More Help?

- Check the [Project Structure](PROJECT_STRUCTURE.md) to understand the codebase
- Review the [Contributing Guide](../CONTRIBUTING.md) for development guidelines
- See the [API Reference](API_REFERENCE.md) for endpoint details

---

**Welcome to Meda!** 🎉 You're now ready to start using the platform.
