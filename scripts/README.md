# 🛠️ Meda Scripts

This folder contains utility scripts for setting up, running, and managing the Meda application.

## 📜 Available Scripts

### Backend Scripts

#### `install-backend.ps1`
Installs all backend dependencies and sets up the Python virtual environment.

**Usage**:
```powershell
.\scripts\install-backend.ps1
```

**What it does**:
- Creates Python virtual environment
- Activates the environment
- Installs all requirements from `requirements.txt`
- Sets up database tables

---

#### `start-backend.ps1`
Starts the FastAPI backend development server.

**Usage**:
```powershell
.\scripts\start-backend.ps1
```

**What it does**:
- Activates virtual environment
- Starts Uvicorn server with auto-reload
- Backend runs on `http://localhost:8000`

**Options**:
- Auto-reload enabled for development
- API docs available at `/docs`

---

#### `start-backend.bat`
Windows batch file alternative for starting the backend.

**Usage**:
```cmd
.\scripts\start-backend.bat
```

---

### Frontend Scripts

#### `start-frontend.bat`
Starts the Next.js frontend development server.

**Usage**:
```cmd
.\scripts\start-frontend.bat
```

**What it does**:
- Navigates to frontend directory
- Runs `npm run dev`
- Frontend runs on `http://localhost:3000`

---

### Diagram Generation Scripts

#### `generate-diagrams.ps1`
Generates architecture diagrams from Mermaid syntax.

**Usage**:
```powershell
.\scripts\generate-diagrams.ps1
```

**What it does**:
- Converts Mermaid diagrams to images
- Generates HTML documentation
- Saves diagrams to `docs/diagrams/`

---

#### `generate-diagrams-simple.ps1`
Simplified version of diagram generation.

**Usage**:
```powershell
.\scripts\generate-diagrams-simple.ps1
```

---

## 🚀 Quick Start Workflow

### First Time Setup

1. **Install Backend**:
   ```powershell
   .\scripts\install-backend.ps1
   ```

2. **Install Frontend**:
   ```cmd
   cd frontend
   npm install
   ```

3. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Update database and API credentials

### Daily Development

1. **Start Backend** (Terminal 1):
   ```powershell
   .\scripts\start-backend.ps1
   ```

2. **Start Frontend** (Terminal 2):
   ```cmd
   .\scripts\start-frontend.bat
   ```

3. **Access Application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

## 📝 Creating New Scripts

When adding new utility scripts:

1. **Place in this folder**: `scripts/`
2. **Use descriptive names**: `action-component.ext`
3. **Add documentation**: Update this README
4. **Include comments**: Explain what the script does
5. **Test thoroughly**: Ensure it works on clean install

## 🔧 Script Requirements

### PowerShell Scripts (.ps1)
- **Windows PowerShell** 5.1+ or **PowerShell Core** 7+
- May require execution policy adjustment:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Batch Scripts (.bat)
- **Windows Command Prompt**
- No special requirements

## ⚠️ Troubleshooting

### PowerShell Execution Policy Error

**Error**: `cannot be loaded because running scripts is disabled`

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Virtual Environment Not Found

**Error**: `venv not found`

**Solution**: Run the install script first:
```powershell
.\scripts\install-backend.ps1
```

### Port Already in Use

**Error**: `Address already in use`

**Solution**: Kill the process using the port:
```powershell
# Find process on port 8000
netstat -ano | findstr :8000
# Kill process (replace PID)
taskkill /PID <PID> /F
```

## 📚 Related Documentation

- [Getting Started Guide](../docs/GETTING_STARTED.md)
- [Backend Documentation](../backend/README.md)
- [Frontend Documentation](../frontend/README.md)

---

**Last Updated**: December 19, 2024
