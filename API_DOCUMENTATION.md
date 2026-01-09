# CareerPath AI - API Documentation

Base URL: `http://localhost:3006/api`

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints (Public)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | `{ email, password, role }` |
| POST | `/auth/verify-otp` | Verify OTP code | `{ email, otp }` |
| POST | `/auth/resend-otp` | Resend OTP code | `{ email }` |
| POST | `/auth/login` | Login user | `{ email, password }` |

### Register
```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "role": "candidate" | "recruiter"
}
```

### Login
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

---

## Profile Endpoints (Candidate Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get current profile | Candidate |
| PUT | `/profile` | Update profile | Candidate |
| POST | `/profile/photo` | Upload profile photo | Candidate |
| DELETE | `/profile/photo` | Delete profile photo | Candidate |
| POST | `/profile/cv` | Upload CV (PDF) | Candidate |
| DELETE | `/profile/cv` | Delete CV | Candidate |

### Update Profile
```json
PUT /profile
{
  "firstName": "Hamdi",
  "lastName": "Abdallah",
  "bio": "Software Engineer",
  "phone": "+216 55 123 456",
  "portfolioLink": "https://linkedin.com/in/hamdi"
}
```

### Upload Photo
```
POST /profile/photo
Content-Type: multipart/form-data
Field: photo (image file, max 2MB)
```

### Upload CV
```
POST /profile/cv
Content-Type: multipart/form-data
Field: cv (PDF file, max 5MB)
```

---

## Jobs Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/jobs` | Get all jobs | All authenticated |
| GET | `/jobs/:id` | Get job by ID | All authenticated |
| POST | `/jobs` | Create job offer | Recruiter |
| PUT | `/jobs/:id` | Update job offer | Recruiter (owner) |
| DELETE | `/jobs/:id` | Delete job offer | Recruiter (owner) |

### Get Jobs (with filters)
```
GET /jobs?contractType=CDI&skill=<skillId>&page=1&limit=10
```

### Create Job
```json
POST /jobs
{
  "title": "Full Stack Developer",
  "description": "Job description...",
  "contractType": "CDI" | "CDD" | "Freelance" | "Stage",
  "salary": "3000-5000 TND",
  "deadline": "2026-03-01",
  "companyId": "<company_id>",
  "skills": ["<skill_id_1>", "<skill_id_2>"]
}
```

---

## Companies Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/companies` | Get all companies | All authenticated |
| GET | `/companies/:id` | Get company by ID | All authenticated |
| GET | `/companies/my` | Get my companies | Recruiter |
| POST | `/companies` | Create company | Recruiter |
| PUT | `/companies/:id` | Update company | Recruiter (owner) |
| DELETE | `/companies/:id` | Delete company | Recruiter (owner) |
| POST | `/companies/:id/logo` | Upload company logo | Recruiter (owner) |
| DELETE | `/companies/:id/logo` | Delete company logo | Recruiter (owner) |

### Create Company
```json
POST /companies
{
  "name": "VERMEG Tunisia",
  "description": "Software company...",
  "location": "Tunis, Tunisia",
  "website": "https://vermeg.com"
}
```

### Upload Logo
```
POST /companies/:id/logo
Content-Type: multipart/form-data
Field: logo (image file, max 2MB)
```

---

## Applications Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/applications` | Get applications | Candidate: own, Recruiter: company jobs |
| GET | `/applications/:id` | Get application by ID | All authenticated |
| POST | `/applications` | Create application | Candidate |
| PUT | `/applications/:id/status` | Update status | Recruiter |

### Get Applications
```
GET /applications
GET /applications?jobId=<job_id>  (Recruiter: filter by job)
```

### Create Application
```json
POST /applications
{
  "jobId": "<job_id>",
  "coverLetter": "Dear hiring manager..."
}
```

### Update Status (Recruiter)
```json
PUT /applications/:id/status
{
  "status": "pending" | "interview" | "accepted" | "rejected"
}
```

---

## Wishlist Endpoints (Candidate Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/wishlist` | Get wishlist | Candidate |
| POST | `/wishlist/:jobId` | Add to wishlist | Candidate |
| DELETE | `/wishlist/:jobId` | Remove from wishlist | Candidate |

---

## Skills Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/skills` | Get all skills | All authenticated |
| POST | `/skills` | Create skill | Admin |
| DELETE | `/skills/:id` | Delete skill | Admin |

### Create Skill (Admin)
```json
POST /skills
{
  "name": "React"
}
```

---

## AI Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/ai/generate-cover-letter` | Generate cover letter | Candidate |
| POST | `/ai/analyze-match` | Analyze candidate match | Recruiter |

### Generate Cover Letter
```json
POST /ai/generate-cover-letter
{
  "jobId": "<job_id>"
}
```

### Analyze Match
```json
POST /ai/analyze-match
{
  "applicationId": "<application_id>"
}
```

---

## Admin Endpoints (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/users` | Get all users | Admin |
| DELETE | `/admin/users/:id` | Delete user (cascade) | Admin |
| DELETE | `/admin/jobs/:id` | Delete job (override) | Admin |

---

## Static Files

| Endpoint | Description |
|----------|-------------|
| `/uploads/photos/*` | Profile photos |
| `/uploads/logos/*` | Company logos |
| `/uploads/cv/*` | CV files (PDF) |

---

## Response Format

### Success Response
```json
{
  "success": tr