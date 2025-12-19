# 🤝 Contributing to Meda

Thank you for your interest in contributing to Meda! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain professional communication

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Git

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/meda.git
   cd meda
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/meda.git
   ```

### Set Up Development Environment

1. **Install backend dependencies**:
   ```bash
   .\scripts\install-backend.ps1
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Configure environment**:
   ```bash
   copy .env.example .env
   # Edit .env with your settings
   ```

4. **Start development servers**:
   ```bash
   # Terminal 1
   .\scripts\start-backend.ps1
   
   # Terminal 2
   .\scripts\start-frontend.bat
   ```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Changes

- Write clean, readable code
- Follow the style guidelines below
- Add comments for complex logic
- Update documentation as needed

### 3. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add patient search functionality"
```

**Commit message format**:
```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat: add PDF export for patient reports
fix: resolve image upload timeout issue
docs: update API reference for notifications
refactor: simplify authentication logic
test: add unit tests for diagnosis service
```

### 4. Keep Your Branch Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push Your Changes

```bash
git push origin feature/your-feature-name
```

## 🎨 Code Style Guidelines

### Python (Backend)

Follow **PEP 8** style guide:

```python
# Good
def get_patient_by_id(db: Session, patient_id: int) -> Patient:
    """
    Retrieve a patient by ID.
    
    Args:
        db: Database session
        patient_id: Patient ID
        
    Returns:
        Patient object or None
    """
    return db.query(Patient).filter(Patient.id == patient_id).first()

# Bad
def getPatient(db,id):
    return db.query(Patient).filter(Patient.id==id).first()
```

**Key points**:
- Use `snake_case` for functions and variables
- Use `PascalCase` for classes
- Add docstrings to all functions
- Type hints for function parameters and returns
- Maximum line length: 100 characters
- Use meaningful variable names

### TypeScript/React (Frontend)

Follow **Airbnb Style Guide** principles:

```typescript
// Good
interface PatientProps {
  patient: Patient;
  onUpdate: (patient: Patient) => void;
}

export default function PatientCard({ patient, onUpdate }: PatientProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    // Implementation
  };
  
  return (
    <div className="patient-card">
      {/* Component JSX */}
    </div>
  );
}

// Bad
export default function patientcard(props) {
  return <div>{props.patient.name}</div>
}
```

**Key points**:
- Use `PascalCase` for components
- Use `camelCase` for functions and variables
- Use TypeScript interfaces for props
- Destructure props
- Use functional components with hooks
- Add JSDoc comments for complex functions

### CSS/Tailwind

```tsx
// Good - Organized Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  
// Bad - Unorganized classes
<div className="p-4 shadow-md flex bg-white items-center rounded-lg hover:shadow-lg justify-between transition-shadow">
```

**Class order**:
1. Layout (flex, grid, block)
2. Positioning (relative, absolute)
3. Sizing (w-, h-)
4. Spacing (p-, m-)
5. Typography (text-, font-)
6. Colors (bg-, text-)
7. Borders (border-, rounded-)
8. Effects (shadow-, opacity-)
9. Transitions/Animations

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Go to GitHub** and create a pull request
3. **Fill out the PR template**:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Wait for approval** before merging

### Review Process

- Maintainers will review within 2-3 business days
- Address all comments and suggestions
- Keep discussions professional and constructive
- Be patient and respectful

## 🧪 Testing Requirements

### Backend Tests

Run backend tests:
```bash
cd backend
pytest
```

**Writing tests**:
```python
def test_create_patient():
    """Test patient creation"""
    patient_data = {
        "name": "John Doe",
        "date_of_birth": "1990-01-01",
        "gender": "male"
    }
    response = client.post("/api/v1/patients", json=patient_data)
    assert response.status_code == 201
    assert response.json()["name"] == "John Doe"
```

### Frontend Tests

Run frontend tests:
```bash
cd frontend
npm test
```

**Writing tests**:
```typescript
describe('PatientCard', () => {
  it('renders patient name', () => {
    const patient = { id: 1, name: 'John Doe' };
    render(<PatientCard patient={patient} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Test Coverage

- Aim for **80%+ coverage**
- All new features must include tests
- Bug fixes should include regression tests

## 📝 Documentation

### Code Documentation

- Add JSDoc/docstrings to all public functions
- Document complex algorithms
- Explain non-obvious code

### User Documentation

Update relevant docs when adding features:
- `docs/FEATURES.md` - Feature descriptions
- `docs/API_REFERENCE.md` - API endpoints
- `docs/GETTING_STARTED.md` - Setup instructions

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's reproducible
- Test on latest version

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 2.0.0]
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
How should it work?

**Describe alternatives**
Other solutions considered

**Additional context**
Screenshots, mockups, etc.
```

## 🏆 Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Credited in documentation

## 📞 Getting Help

- **Documentation**: [docs/README.md](docs/README.md)
- **Discussions**: GitHub Discussions
- **Issues**: GitHub Issues
- **Email**: dev@meda.example.com

## 📚 Additional Resources

- [Getting Started Guide](docs/GETTING_STARTED.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)

---

**Thank you for contributing to Meda!** 🎉

Your contributions help improve healthcare for everyone.
