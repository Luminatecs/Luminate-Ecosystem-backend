# Organization Ward Enrollment API Documentation

## Base URL
```
http://localhost:3001/api
```

---

## 🔐 Authentication Endpoints

### 1. Login with Temporary Code
**Endpoint:** `POST /auth/temp-login`  
**Access:** Public  
**Description:** Login using temporary credentials sent to guardian's email

**Request Body:**
```json
{
  "tempCode": "lumtempcode-123e4567-e89b-12d3-a456-426614174000",
  "password": "TempPass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": "user-uuid",
      "username": "ward_1234567_abc",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "ORG_WARD"
    },
    "requiresPasswordChange": true,
    "tempCode": "lumtempcode-123e4567-e89b-12d3-a456-426614174000"
  },
  "message": "Login successful. Please change your password."
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid temporary credentials"
}
```

---

### 2. Change Temporary Password
**Endpoint:** `POST /auth/change-temp-password`  
**Access:** Private (requires authentication)  
**Description:** Change temporary credentials to permanent username and password

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "tempCode": "lumtempcode-123e4567-e89b-12d3-a456-426614174000",
  "newUsername": "john_doe_2024",
  "newPassword": "MySecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login with your new credentials."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Username already taken"
}
```

---

### 3. Forgot Password
**Endpoint:** `POST /auth/forgot-password`  
**Access:** Public  
**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link will be sent."
}
```

---

### 4. Reset Password
**Endpoint:** `POST /auth/reset-password`  
**Access:** Public  
**Description:** Reset password using token from email

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "This reset token has expired. Please request a new one."
}
```

---

### 5. Validate Reset Token
**Endpoint:** `GET /auth/validate-reset-token/:token`  
**Access:** Public  
**Description:** Check if password reset token is valid

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true
  },
  "message": "Token is valid"
}
```

---

## 📝 Enrollment Endpoints

### 1. Create Single Enrollment
**Endpoint:** `POST /enrollment/single`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Create a single student enrollment

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "organizationId": "org-uuid",
  "enrollmentData": {
    "student": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "2010-05-15",
      "gender": "Male",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": "123 Main Street, City, State, ZIP"
    },
    "guardian": {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@example.com",
      "phone": "+0987654321",
      "relation": "Mother",
      "age": 35
    },
    "enrollment": {
      "gradeLevel": "5",
      "academicYear": "2024-2025"
    }
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "enrollment-uuid",
    "userId": "user-uuid",
    "guardianId": "guardian-uuid",
    "tempCode": "lumtempcode-123e4567-e89b-12d3-a456-426614174000"
  },
  "message": "Student enrollment created successfully"
}
```

---

### 2. Process Bulk Enrollment
**Endpoint:** `POST /enrollment/bulk`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Process bulk student enrollment from CSV data

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "organizationId": "org-uuid",
  "enrollmentData": [
    {
      "student": { ... },
      "guardian": { ... },
      "enrollment": { ... }
    },
    ...
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProcessed": 10,
    "successful": 8,
    "failed": 2,
    "results": [
      {
        "studentName": "John Doe",
        "success": true,
        "message": "Enrollment created successfully",
        "enrollmentId": "enrollment-uuid"
      },
      {
        "studentName": "Jane Smith",
        "success": false,
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

### 3. Get Organization Enrollments
**Endpoint:** `GET /enrollment/organization/:organizationId`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Get all enrollments for an organization with optional filters

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): PENDING, ACTIVE, INACTIVE, GRADUATED, TRANSFERRED, WITHDRAWN
- `academicYear` (optional): e.g., 2024-2025
- `gradeLevel` (optional): e.g., 5

**Example:**
```
GET /enrollment/organization/org-uuid?status=ACTIVE&academicYear=2024-2025
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "enrollment-uuid",
      "organization_id": "org-uuid",
      "student_id": "user-uuid",
      "enrollment_status": "ACTIVE",
      "academic_year": "2024-2025",
      "grade_level": "5",
      "student_first_name": "John",
      "student_last_name": "Doe",
      "student_email": "john.doe@example.com",
      "guardian_first_name": "Jane",
      "guardian_last_name": "Doe",
      "guardian_email": "jane.doe@example.com",
      "guardian_phone": "+0987654321",
      "guardian_relation": "Mother",
      "created_at": "2024-12-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 4. Update Enrollment Status
**Endpoint:** `PUT /enrollment/:enrollmentId/status`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Update enrollment status

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```

**Valid Statuses:**
- `PENDING` - Initial state after enrollment
- `ACTIVE` - Student actively enrolled
- `INACTIVE` - Temporarily inactive
- `GRADUATED` - Student graduated
- `TRANSFERRED` - Transferred to another institution
- `WITHDRAWN` - Withdrawn from program

**Success Response (200):**
```json
{
  "success": true,
  "message": "Enrollment status updated successfully"
}
```

---

### 5. Delete Enrollment
**Endpoint:** `DELETE /enrollment/:enrollmentId`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Soft delete an enrollment

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Enrollment deleted successfully"
}
```

---

### 6. Get Enrollment Statistics
**Endpoint:** `GET /enrollment/stats/:organizationId`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Get enrollment statistics for an organization

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "ACTIVE": 120,
      "PENDING": 15,
      "INACTIVE": 10,
      "GRADUATED": 5
    },
    "byGradeLevel": {
      "5": 30,
      "6": 35,
      "7": 28,
      "8": 32,
      "9": 25
    }
  }
}
```

---

## 📄 CSV Endpoints

### 1. Download CSV Template
**Endpoint:** `GET /enrollment/csv/template`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Download CSV template for bulk enrollment

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
Returns CSV file with headers and example row:
```csv
Student First Name,Student Last Name,Student Date of Birth (YYYY-MM-DD),Student Gender (Male/Female/Other),Student Email,Student Phone,Student Address,Grade Level,Academic Year,Guardian First Name,Guardian Last Name,Guardian Email,Guardian Phone,Guardian Relation (Father/Mother/Guardian/Other),Guardian Age
John,Doe,2010-05-15,Male,john.doe@example.com,+1234567890,123 Main Street,5,2024-2025,Jane,Doe,jane.doe@example.com,+0987654321,Mother,35
```

---

### 2. Validate CSV
**Endpoint:** `POST /enrollment/csv/validate`  
**Access:** Private (ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN)  
**Description:** Validate CSV file content before processing

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "csvContent": "Student First Name,Student Last Name,...\nJohn,Doe,..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "validCount": 8,
    "errorCount": 2,
    "validData": [
      {
        "student": { ... },
        "guardian": { ... },
        "enrollment": { ... }
      }
    ],
    "errors": [
      {
        "row": 5,
        "errors": [
          "Guardian email is required and must be valid",
          "Student date of birth must be in YYYY-MM-DD format"
        ]
      }
    ]
  }
}
```

---

## 🔑 Authorization Roles

### Role Hierarchy:
1. **SUPER_ADMIN** - Full system access
2. **ACCESS_ADMIN** - Same privileges as SUPER_ADMIN (new role)
3. **ORG_ADMIN** - Organization administration
4. **ORG_WARD** - Student/ward user (created via enrollment)
5. **ORG_USER** - Regular organization user

### Role Permissions for Enrollment:
- **Can Create Enrollments:** ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN
- **Can View Enrollments:** ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN (own org only for ORG_ADMIN)
- **Can Update Status:** ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN
- **Can Delete:** ORG_ADMIN, SUPER_ADMIN, ACCESS_ADMIN

---

## 📧 Email Notifications

### Guardian Credentials Email
Sent automatically when enrollment is created.

**Email Content:**
- Subject: "Welcome to {Organization Name} - Your Access Credentials"
- Contains: Temporary code, temporary password, organization name, student name, expiry date (5 days)
- Beautiful HTML template with gradients and borders (no box-shadow)

### Password Reset Email
Sent when user requests password reset.

**Email Content:**
- Subject: "Password Reset Request"
- Contains: Reset link with token, expiry time (1 hour)
- User name and security instructions

---

## 🔄 Complete Enrollment Flow

### For Organization Admin:
1. Download CSV template (`GET /enrollment/csv/template`)
2. Fill in student/guardian data
3. Validate CSV (`POST /enrollment/csv/validate`)
4. Fix any errors
5. Submit bulk enrollment (`POST /enrollment/bulk`)
6. System creates ORG_WARD users + guardians + temp credentials
7. System sends emails to all guardians

### For Guardian (First-Time Login):
1. Receive email with temp code and password
2. Login with temp code (`POST /auth/temp-login`)
3. System responds with `requiresPasswordChange: true`
4. Frontend shows password change modal
5. Change password (`POST /auth/change-temp-password`)
6. System invalidates temp code
7. Logout and login with new permanent credentials

### For Regular Users (Forgot Password):
1. Click "Forgot Password" link
2. Enter email (`POST /auth/forgot-password`)
3. Receive password reset email
4. Click link with token
5. Frontend validates token (`GET /auth/validate-reset-token/:token`)
6. Enter new password (`POST /auth/reset-password`)
7. Login with new credentials

---

## ⚠️ Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials/token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔐 Security Features

1. **JWT Authentication** - Bearer token required for protected endpoints
2. **Password Hashing** - Bcrypt with salt rounds
3. **SQL Injection Prevention** - Parameterized queries
4. **Email Enumeration Prevention** - Generic responses for forgot password
5. **Token Expiry** - Temp credentials (5 days), Reset tokens (1 hour)
6. **One-Time Use** - Temp codes and reset tokens invalidated after use
7. **Role-Based Access Control** - Middleware enforces permissions

---

## 📦 Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/luminate

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Email
EMAIL_ENABLED=false  # Set to true when configured
EMAIL_FROM=noreply@luminate.edu
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all ID fields
- Soft delete is implemented (deleted_at column)
- CSV processing is synchronous for error tracking
- Email sending happens outside transactions
- Temp codes format: `lumtempcode-{uuid}`
- Academic year format: `YYYY-YYYY` (e.g., 2024-2025)

---

**Last Updated:** December 2024  
**API Version:** 1.0.0
