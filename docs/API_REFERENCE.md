# 📡 API Reference

Complete reference for all Meda API endpoints.

**Base URL**: `http://localhost:8000/api/v1` (development)  
**Production URL**: `https://meda-backend.onrender.com/api/v1`

**Interactive Documentation**: Visit `/docs` for Swagger UI or `/redoc` for ReDoc

## 🔐 Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Register

**POST** `/auth/register`

Create a new user account.

**Request Body**:
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "full_name": "Dr. John Doe"
}
```

**Response** (201):
```json
{
  "id": 1,
  "email": "doctor@example.com",
  "full_name": "Dr. John Doe",
  "totp_secret": "JBSWY3DPEHPK3PXP",
  "totp_uri": "otpauth://totp/Meda:doctor@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Meda"
}
```

### Login

**POST** `/auth/login`

Authenticate and receive JWT tokens.

**Request Body**:
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "totp_code": "123456"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

**Response** (200):
```json
{
  "id": 1,
  "email": "doctor@example.com",
  "full_name": "Dr. John Doe",
  "is_active": true,
  "is_verified": true,
  "created_at": "2024-12-19T10:00:00Z"
}
```

## 👥 Patients

### List Patients

**GET** `/patients`

Get all patients for the current user.

**Query Parameters**:
- `search` (optional): Search by name
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Max records to return (default: 100)

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "Jane Smith",
    "date_of_birth": "1985-05-15",
    "gender": "female",
    "phone": "+1234567890",
    "email": "jane@example.com",
    "created_at": "2024-12-19T10:00:00Z"
  }
]
```

### Create Patient

**POST** `/patients`

Create a new patient record.

**Request Body**:
```json
{
  "name": "Jane Smith",
  "date_of_birth": "1985-05-15",
  "gender": "female",
  "phone": "+1234567890",
  "email": "jane@example.com",
  "address": "123 Main St, City, Country",
  "medical_history": "No significant medical history",
  "allergies": "Penicillin"
}
```

**Response** (201):
```json
{
  "id": 1,
  "name": "Jane Smith",
  "date_of_birth": "1985-05-15",
  "gender": "female",
  "phone": "+1234567890",
  "email": "jane@example.com",
  "address": "123 Main St, City, Country",
  "medical_history": "No significant medical history",
  "allergies": "Penicillin",
  "created_at": "2024-12-19T10:00:00Z",
  "updated_at": "2024-12-19T10:00:00Z"
}
```

### Get Patient

**GET** `/patients/{patient_id}`

Get a specific patient by ID.

**Response** (200): Same as Create Patient response

### Update Patient

**PUT** `/patients/{patient_id}`

Update patient information.

**Request Body**: Same as Create Patient

**Response** (200): Updated patient object

### Delete Patient

**DELETE** `/patients/{patient_id}`

Delete a patient record.

**Response** (200):
```json
{
  "message": "Patient deleted successfully"
}
```

## 🖼️ Medical Images

### Upload Image

**POST** `/images/upload`

Upload a medical image.

**Request**: Multipart form data
- `file`: Image file
- `patient_id`: Patient ID (integer)
- `description`: Image description (optional)

**Response** (201):
```json
{
  "id": 1,
  "filename": "xray_chest.jpg",
  "cloudinary_url": "https://res.cloudinary.com/...",
  "cloudinary_public_id": "meda/abc123",
  "file_type": "image/jpeg",
  "file_size": 2048576,
  "patient_id": 1,
  "description": "Chest X-ray",
  "created_at": "2024-12-19T10:00:00Z"
}
```

### List Images

**GET** `/images`

Get all images for the current user.

**Query Parameters**:
- `patient_id` (optional): Filter by patient
- `skip` (optional): Pagination offset
- `limit` (optional): Max records

**Response** (200): Array of image objects

### Get Image

**GET** `/images/{image_id}`

Get a specific image by ID.

**Response** (200): Image object

### Delete Image

**DELETE** `/images/{image_id}`

Delete an image.

**Response** (200):
```json
{
  "message": "Image deleted successfully"
}
```

## 🏥 Consultations

### Create Consultation

**POST** `/consultations`

Create a new consultation.

**Request Body**:
```json
{
  "patient_id": 1,
  "chief_complaint": "Persistent cough",
  "symptoms": {
    "cough": true,
    "fever": false,
    "fatigue": true
  },
  "vital_signs": {
    "temperature": 37.2,
    "blood_pressure": "120/80",
    "heart_rate": 75,
    "respiratory_rate": 16
  },
  "notes": "Patient reports symptoms for 2 weeks"
}
```

**Response** (201):
```json
{
  "id": 1,
  "patient_id": 1,
  "doctor_id": 1,
  "chief_complaint": "Persistent cough",
  "symptoms": {...},
  "vital_signs": {...},
  "consultation_date": "2024-12-19T10:00:00Z",
  "created_at": "2024-12-19T10:00:00Z"
}
```

### Get Consultations

**GET** `/consultations`

List all consultations for current user.

**Query Parameters**:
- `patient_id` (optional): Filter by patient

**Response** (200): Array of consultation objects

### Get Consultation

**GET** `/consultations/{consultation_id}`

Get specific consultation with analysis.

**Response** (200):
```json
{
  "id": 1,
  "patient": {...},
  "chief_complaint": "Persistent cough",
  "symptoms": {...},
  "vital_signs": {...},
  "analysis": {
    "diagnosis": "Upper respiratory tract infection",
    "differential_diagnoses": [...],
    "recommended_tests": [...],
    "priority": "ROUTINE"
  }
}
```

## 🤖 AI Diagnosis

### Generate Diagnosis

**POST** `/diagnosis/generate`

Generate AI-powered diagnosis for a consultation.

**Request Body**:
```json
{
  "consultation_id": 1
}
```

**Response** (200):
```json
{
  "diagnosis": "Upper Respiratory Tract Infection (URTI)",
  "differential_diagnoses": [
    {
      "condition": "Bronchitis",
      "probability": "high",
      "reasoning": "Persistent cough with fatigue"
    },
    {
      "condition": "Pneumonia",
      "probability": "medium",
      "reasoning": "Consider if fever develops"
    }
  ],
  "recommended_tests": [
    {
      "test": "Chest X-ray",
      "priority": "ROUTINE",
      "justification": "Rule out pneumonia"
    }
  ],
  "priority": "ROUTINE",
  "confidence_score": 0.85
}
```

## 📄 Reports

### Generate Consultation Report

**GET** `/reports/consultation/{consultation_id}`

Generate PDF report for a consultation.

**Response** (200): PDF file download

### Generate Patient Report

**GET** `/reports/patient/{patient_id}`

Generate comprehensive patient report.

**Response** (200): PDF file download

## 🔔 Notifications

### Get Notifications

**GET** `/notifications`

Get notifications for current user.

**Query Parameters**:
- `unread_only` (optional): Boolean, default false
- `limit` (optional): Max records, default 50

**Response** (200):
```json
[
  {
    "id": 1,
    "type": "share",
    "title": "Consultation partagée",
    "message": "Dr. Smith a partagé une consultation avec vous",
    "link": "/consultations/123",
    "is_read": false,
    "created_at": "2024-12-19T10:00:00Z"
  }
]
```

### Get Unread Count

**GET** `/notifications/unread-count`

Get count of unread notifications.

**Response** (200):
```json
{
  "count": 5
}
```

### Mark as Read

**PATCH** `/notifications/{notification_id}/read`

Mark a notification as read.

**Response** (200):
```json
{
  "message": "Notification marked as read"
}
```

### Mark All as Read

**PATCH** `/notifications/read-all`

Mark all notifications as read.

**Response** (200):
```json
{
  "message": "5 notifications marked as read",
  "count": 5
}
```

### Delete Notification

**DELETE** `/notifications/{notification_id}`

Delete a notification.

**Response** (200):
```json
{
  "message": "Notification deleted"
}
```

## 🤝 Collaboration

### Share Consultation

**POST** `/collaboration/share`

Share a consultation with another doctor.

**Request Body**:
```json
{
  "consultation_id": 1,
  "recipient_email": "colleague@example.com",
  "permission": "READ"
}
```

**Response** (201):
```json
{
  "id": 1,
  "consultation_id": 1,
  "shared_with_id": 2,
  "permission": "READ",
  "created_at": "2024-12-19T10:00:00Z"
}
```

### Get Shared Consultations

**GET** `/collaboration/shared-with-me`

Get consultations shared with current user.

**Response** (200): Array of shared consultation objects

### Add Comment

**POST** `/collaboration/consultations/{consultation_id}/comments`

Add a comment to a consultation.

**Request Body**:
```json
{
  "content": "I agree with the diagnosis. Consider adding..."
}
```

**Response** (201):
```json
{
  "id": 1,
  "consultation_id": 1,
  "user_id": 1,
  "content": "I agree with the diagnosis. Consider adding...",
  "created_at": "2024-12-19T10:00:00Z"
}
```

### Get Comments

**GET** `/collaboration/consultations/{consultation_id}/comments`

Get all comments for a consultation.

**Response** (200): Array of comment objects

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **422**: Unprocessable Entity (validation error)
- **500**: Internal Server Error

## 🔄 Rate Limiting

Currently no rate limiting is implemented. This will be added in future versions.

## 📚 Additional Resources

- **Interactive API Docs**: Visit `/docs` on your backend server
- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Getting Started**: [GETTING_STARTED.md](GETTING_STARTED.md)

---

**API Version**: 1.0  
**Last Updated**: December 19, 2024
