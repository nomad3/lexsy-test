# Lexsy API Documentation

Version: 1.0.0
Base URL: `http://localhost:5000/api` (Development)
Last Updated: 2025-01-18

---

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Documents](#document-endpoints)
   - [Conversations](#conversation-endpoints-planned)
   - [Data Room](#data-room-endpoints-planned)
   - [Knowledge Graph](#knowledge-graph-endpoints-planned)
   - [Analytics](#analytics-endpoints-planned)

---

## Introduction

The Lexsy REST API provides programmatic access to the Lexsy legal document automation platform. The API allows you to upload documents, extract placeholders, fill documents through conversational AI, manage data room intelligence, and access analytics.

**Key Features:**
- AI-powered document analysis and placeholder extraction
- Conversational document filling with intelligent suggestions
- Cross-document intelligence and synchronization
- Natural language search capabilities
- Document health scoring and validation

**Authentication:** JWT-based bearer token authentication
**Content Type:** `application/json` (except file uploads which use `multipart/form-data`)
**HTTPS:** Required in production

---

## Authentication

All API requests (except registration and login) require authentication using JWT (JSON Web Tokens).

### Obtaining a Token

1. **Register** a new account: `POST /api/auth/register`
2. **Login** with credentials: `POST /api/auth/login`
3. The response will include a `token` field containing the JWT

### Using the Token

Include the token in the `Authorization` header of all requests:

```http
Authorization: Bearer <your-jwt-token>
```

Alternatively, the token can be sent as an HttpOnly cookie (automatic in browser environments):

```http
Cookie: token=<your-jwt-token>
```

### Token Expiration

- Default expiration: 24 hours
- When a token expires, you'll receive a `401 Unauthorized` response
- Refresh your token by logging in again

### Example

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@example.com",
    "password": "SecurePass123"
  }'

# Use token in subsequent requests
curl -X GET http://localhost:5000/api/documents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response payload varies by endpoint
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error occurred |

---

## Error Handling

### Common Error Codes

| Error Code | HTTP Status | Description |
|-----------|-------------|-------------|
| `MISSING_FIELDS` | 400 | Required fields are missing |
| `INVALID_EMAIL` | 400 | Email format is invalid |
| `WEAK_PASSWORD` | 400 | Password doesn't meet requirements |
| `INVALID_ROLE` | 400 | User role is invalid |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `NO_FILE` | 400 | No file was uploaded |
| `USER_EXISTS` | 409 | User with email already exists |
| `MISSING_CREDENTIALS` | 400 | Email or password missing |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `ACCOUNT_INACTIVE` | 403 | User account is disabled |
| `NO_TOKEN` | 401 | No authentication token provided |
| `INVALID_TOKEN` | 401 | Authentication token is invalid |
| `INVALID_USER` | 401 | User not found or inactive |
| `NOT_AUTHENTICATED` | 401 | User must be authenticated |
| `DOCUMENT_NOT_FOUND` | 404 | Document doesn't exist or no access |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Invalid file type. Only .docx files are allowed"
  }
}
```

---

## Rate Limiting

To ensure service quality, the API implements rate limiting:

### Default Limits

- **General API endpoints:** 100 requests per 15 minutes per IP address
- **Authentication endpoints:** 5 requests per 15 minutes per IP address

### Rate Limit Headers

When rate limiting is active, responses include these headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642531200
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

**HTTP Status:** 429 Too Many Requests

---

## Endpoints

### Authentication Endpoints

#### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`
**Authentication:** Not required

##### Request Headers

```http
Content-Type: application/json
```

##### Request Body

```typescript
{
  email: string;           // Valid email address
  password: string;        // Minimum 8 characters
  fullName: string;        // User's full name
  role: "lawyer" | "admin"; // User role
  organization?: string;   // Optional organization name
}
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.doe@lawfirm.com",
    "password": "SecurePass123!",
    "fullName": "Jane Doe",
    "role": "lawyer",
    "organization": "Doe & Associates"
  }'
```

##### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane.doe@lawfirm.com",
      "fullName": "Jane Doe",
      "role": "lawyer",
      "organization": "Doe & Associates",
      "createdAt": "2025-01-18T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "Email, password, full name, and role are required"
  }
}
```

**400 Bad Request - Invalid Email**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Invalid email format"
  }
}
```

**400 Bad Request - Weak Password**
```json
{
  "success": false,
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "Password must be at least 8 characters long"
  }
}
```

**409 Conflict - User Exists**
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "User with this email already exists"
  }
}
```

---

#### Login User

Authenticate and receive a JWT token.

**Endpoint:** `POST /api/auth/login`
**Authentication:** Not required

##### Request Headers

```http
Content-Type: application/json
```

##### Request Body

```typescript
{
  email: string;     // User's email address
  password: string;  // User's password
}
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.doe@lawfirm.com",
    "password": "SecurePass123!"
  }'
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "jane.doe@lawfirm.com",
      "fullName": "Jane Doe",
      "role": "lawyer",
      "organization": "Doe & Associates",
      "lastLogin": "2025-01-18T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Error Responses

**400 Bad Request - Missing Credentials**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_CREDENTIALS",
    "message": "Email and password are required"
  }
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**403 Forbidden - Inactive Account**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Account is inactive. Please contact support"
  }
}
```

---

### Document Endpoints

#### Upload Document

Upload a new legal document for processing.

**Endpoint:** `POST /api/documents/upload`
**Authentication:** Required

##### Request Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

##### Request Body (Form Data)

```typescript
{
  document: File;  // .docx file (max 10MB)
}
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "document=@/path/to/safe_agreement.docx"
```

##### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "filename": "safe_agreement.docx",
      "filePath": "/uploads/document-1642531200000-123456789.docx",
      "uploadDate": "2025-01-18T10:40:00.000Z",
      "status": "uploaded",
      "documentType": "unknown",
      "completionPercentage": 0,
      "userId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

##### Error Responses

**400 Bad Request - No File**
```json
{
  "success": false,
  "error": {
    "code": "NO_FILE",
    "message": "No file uploaded"
  }
}
```

**400 Bad Request - Invalid File Type**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Invalid file type. Only .docx files are allowed"
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "User not authenticated"
  }
}
```

**413 Payload Too Large**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum limit of 10MB"
  }
}
```

---

#### Get All Documents

Retrieve all documents for the authenticated user.

**Endpoint:** `GET /api/documents`
**Authentication:** Required

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X GET http://localhost:5000/api/documents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "filename": "safe_agreement.docx",
        "filePath": "/uploads/document-1642531200000-123456789.docx",
        "uploadDate": "2025-01-18T10:40:00.000Z",
        "status": "ready",
        "documentType": "SAFE Agreement",
        "aiClassificationConfidence": 0.95,
        "riskScore": 35,
        "completionPercentage": 0,
        "userId": "550e8400-e29b-41d4-a716-446655440000"
      },
      {
        "id": "8d0f7780-8536-51ef-b05c-f18gd2g01bf8",
        "filename": "nda_draft.docx",
        "filePath": "/uploads/document-1642531250000-987654321.docx",
        "uploadDate": "2025-01-18T11:15:00.000Z",
        "status": "completed",
        "documentType": "Non-Disclosure Agreement",
        "aiClassificationConfidence": 0.98,
        "riskScore": 12,
        "completionPercentage": 100,
        "userId": "550e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }
}
```

##### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "User not authenticated"
  }
}
```

---

#### Get Document by ID

Retrieve a specific document by its ID.

**Endpoint:** `GET /api/documents/:id`
**Authentication:** Required

##### URL Parameters

- `id` (string, required) - Document UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X GET http://localhost:5000/api/documents/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "filename": "safe_agreement.docx",
      "filePath": "/uploads/document-1642531200000-123456789.docx",
      "uploadDate": "2025-01-18T10:40:00.000Z",
      "status": "ready",
      "documentType": "SAFE Agreement",
      "aiClassificationConfidence": 0.95,
      "riskScore": 35,
      "completionPercentage": 0,
      "metadata": {
        "pageCount": 5,
        "wordCount": 1250,
        "detectedJurisdiction": "Delaware"
      },
      "userId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

##### Error Responses

**400 Bad Request - Missing ID**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_ID",
    "message": "Document ID is required"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found"
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "User not authenticated"
  }
}
```

---

#### Analyze Document

Trigger AI-powered document analysis to classify the document type.

**Endpoint:** `POST /api/documents/:id/analyze`
**Authentication:** Required

##### URL Parameters

- `id` (string, required) - Document UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/documents/7c9e6679-7425-40de-944b-e07fc1f90ae7/analyze \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "analysis": {
      "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "documentType": "SAFE Agreement",
      "confidence": 0.95,
      "riskScore": 35,
      "complexity": "medium",
      "estimatedFillTime": 15,
      "jurisdiction": "Delaware",
      "keyTerms": [
        "valuation cap",
        "discount rate",
        "conversion trigger"
      ],
      "suggestedTemplate": "safe-y-combinator-post-money",
      "metadata": {
        "pageCount": 5,
        "wordCount": 1250,
        "clauseCount": 12
      }
    }
  }
}
```

##### Error Responses

**400 Bad Request - Missing ID**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_ID",
    "message": "Document ID is required"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found"
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "User not authenticated"
  }
}
```

---

#### Extract Placeholders

Extract placeholders (fillable fields) from a document using AI.

**Endpoint:** `POST /api/documents/:id/placeholders`
**Authentication:** Required

##### URL Parameters

- `id` (string, required) - Document UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/documents/7c9e6679-7425-40de-944b-e07fc1f90ae7/placeholders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "placeholders": [
      {
        "id": "9f1g8891-9647-62fg-c16d-g29he3h12cg9",
        "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "fieldName": "company_name",
        "fieldType": "text",
        "originalText": "[COMPANY NAME]",
        "position": 125,
        "filledValue": null,
        "aiSuggestedValue": "TechCo Inc.",
        "suggestionSource": "data_room",
        "confidence": 0.88,
        "validationStatus": "pending",
        "validationNotes": null
      },
      {
        "id": "0g2h9902-0758-73gh-d27e-h30if4i23dh0",
        "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "fieldName": "valuation_cap",
        "fieldType": "currency",
        "originalText": "[VALUATION CAP]",
        "position": 890,
        "filledValue": null,
        "aiSuggestedValue": "$10,000,000",
        "suggestionSource": "similar_documents",
        "confidence": 0.72,
        "validationStatus": "pending",
        "validationNotes": null
      },
      {
        "id": "1h3i0013-1869-84hi-e38f-i41jg5j34ei1",
        "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "fieldName": "investor_name",
        "fieldType": "text",
        "originalText": "[INVESTOR NAME]",
        "position": 245,
        "filledValue": null,
        "aiSuggestedValue": null,
        "suggestionSource": null,
        "confidence": 0.0,
        "validationStatus": "pending",
        "validationNotes": null
      }
    ]
  }
}
```

##### Error Responses

**400 Bad Request - Missing ID**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_ID",
    "message": "Document ID is required"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found"
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "User not authenticated"
  }
}
```

---

#### Delete Document

Delete a document and all associated data.

**Endpoint:** `DELETE /api/documents/:id`
**Authentication:** Required

##### URL Parameters

- `id` (string, required) - Document UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X DELETE http://localhost:5000/api/documents/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Document deleted successfully",
    "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }
}
```

##### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found"
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "User not authenticated"
  }
}
```

---

### Conversation Endpoints (Planned)

These endpoints enable conversational document filling through AI-powered dialogue.

#### Start Conversation

Begin a conversational filling session for a document.

**Endpoint:** `POST /api/conversations/start`
**Authentication:** Required
**Status:** Planned

##### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

##### Request Body

```typescript
{
  documentId: string;  // UUID of document to fill
}
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/conversations/start \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }'
```

##### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "2i4j1124-2970-95ij-f49g-j52kh6k45fj2",
      "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "status": "active",
      "currentQuestion": {
        "placeholderId": "9f1g8891-9647-62fg-c16d-g29he3h12cg9",
        "question": "What is the name of the company issuing the SAFE?",
        "fieldType": "text",
        "suggestions": ["TechCo Inc.", "TechCo Corporation"],
        "context": "This will appear as the issuer in the agreement header."
      },
      "progress": {
        "total": 12,
        "completed": 0,
        "percentage": 0
      },
      "createdAt": "2025-01-18T11:30:00.000Z"
    }
  }
}
```

---

#### Send Message

Send a message in an active conversation to answer questions or request clarification.

**Endpoint:** `POST /api/conversations/:id/message`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `id` (string, required) - Conversation UUID

##### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

##### Request Body

```typescript
{
  message: string;  // User's response or question
}
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/conversations/2i4j1124-2970-95ij-f49g-j52kh6k45fj2/message \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "TechCo Inc."
  }'
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "acknowledged": true,
    "nextQuestion": {
      "placeholderId": "0g2h9902-0758-73gh-d27e-h30if4i23dh0",
      "question": "What is the valuation cap for this SAFE? I suggest $10,000,000 based on similar rounds.",
      "fieldType": "currency",
      "suggestions": ["$10,000,000", "$8,000,000", "$12,000,000"],
      "context": "The valuation cap sets the maximum company valuation at which the SAFE converts to equity."
    },
    "progress": {
      "total": 12,
      "completed": 1,
      "percentage": 8
    }
  }
}
```

---

#### Get Conversation History

Retrieve the complete message history for a conversation.

**Endpoint:** `GET /api/conversations/:id/history`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `id` (string, required) - Conversation UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X GET http://localhost:5000/api/conversations/2i4j1124-2970-95ij-f49g-j52kh6k45fj2/history \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "2i4j1124-2970-95ij-f49g-j52kh6k45fj2",
      "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "status": "active",
      "createdAt": "2025-01-18T11:30:00.000Z"
    },
    "messages": [
      {
        "id": "3j5k2235-3081-06jk-g50h-k63li7l56gk3",
        "role": "assistant",
        "content": "What is the name of the company issuing the SAFE?",
        "timestamp": "2025-01-18T11:30:00.000Z"
      },
      {
        "id": "4k6l3346-4192-17kl-h61i-l74mj8m67hl4",
        "role": "user",
        "content": "TechCo Inc.",
        "timestamp": "2025-01-18T11:30:15.000Z"
      },
      {
        "id": "5l7m4457-5203-28lm-i72j-m85nk9n78im5",
        "role": "assistant",
        "content": "What is the valuation cap for this SAFE? I suggest $10,000,000 based on similar rounds.",
        "timestamp": "2025-01-18T11:30:17.000Z"
      }
    ]
  }
}
```

---

#### Fill Placeholder

Directly fill a specific placeholder without conversational flow.

**Endpoint:** `POST /api/conversations/:id/fill-placeholder`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `id` (string, required) - Conversation UUID

##### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

##### Request Body

```typescript
{
  placeholderId: string;  // UUID of placeholder to fill
  value: string;          // Value to fill
}
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/conversations/2i4j1124-2970-95ij-f49g-j52kh6k45fj2/fill-placeholder \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "placeholderId": "9f1g8891-9647-62fg-c16d-g29he3h12cg9",
    "value": "TechCo Inc."
  }'
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "placeholder": {
      "id": "9f1g8891-9647-62fg-c16d-g29he3h12cg9",
      "fieldName": "company_name",
      "filledValue": "TechCo Inc.",
      "validationStatus": "validated"
    },
    "relatedUpdates": [
      {
        "documentId": "8d0f7780-8536-51ef-b05c-f18gd2g01bf8",
        "placeholderId": "6m8n5568-6314-39mn-j83k-n96ol0o89jn6",
        "fieldName": "company_name",
        "suggestedValue": "TechCo Inc.",
        "reason": "Same company name used in related NDA"
      }
    ]
  }
}
```

---

#### Complete Conversation

Mark a conversation as complete and finalize the document.

**Endpoint:** `POST /api/conversations/:id/complete`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `id` (string, required) - Conversation UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/conversations/2i4j1124-2970-95ij-f49g-j52kh6k45fj2/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "2i4j1124-2970-95ij-f49g-j52kh6k45fj2",
      "status": "completed",
      "completedAt": "2025-01-18T11:45:00.000Z"
    },
    "document": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "status": "completed",
      "completionPercentage": 100,
      "healthScore": 92,
      "downloadUrl": "/api/documents/7c9e6679-7425-40de-944b-e07fc1f90ae7/download"
    }
  }
}
```

---

### Data Room Endpoints (Planned)

Data room endpoints manage company documents that power intelligent suggestions.

#### Upload Data Room Document

Upload a company document to the data room for entity extraction.

**Endpoint:** `POST /api/dataroom/upload`
**Authentication:** Required
**Status:** Planned

##### Request Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

##### Request Body (Form Data)

```typescript
{
  document: File;      // .docx, .pdf, or .txt file (max 50MB)
  category: string;    // "financial" | "legal" | "corporate" | "other"
  description?: string; // Optional description
}
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/dataroom/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "document=@/path/to/cap_table.xlsx" \
  -F "category=financial" \
  -F "description=Q4 2024 capitalization table"
```

##### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "7n0o6679-7425-50no-k94l-o07pn1p90ko7",
      "filename": "cap_table.xlsx",
      "category": "financial",
      "description": "Q4 2024 capitalization table",
      "uploadDate": "2025-01-18T12:00:00.000Z",
      "processingStatus": "pending",
      "userId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

---

#### Get Data Room Documents

Retrieve all documents in the user's data room.

**Endpoint:** `GET /api/dataroom/documents`
**Authentication:** Required
**Status:** Planned

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Query Parameters

- `category` (string, optional) - Filter by category: "financial" | "legal" | "corporate" | "other"
- `status` (string, optional) - Filter by status: "pending" | "processed" | "failed"

##### Example Request

```bash
curl -X GET "http://localhost:5000/api/dataroom/documents?category=financial" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "7n0o6679-7425-50no-k94l-o07pn1p90ko7",
        "filename": "cap_table.xlsx",
        "category": "financial",
        "description": "Q4 2024 capitalization table",
        "uploadDate": "2025-01-18T12:00:00.000Z",
        "processingStatus": "processed",
        "extractedEntities": 45,
        "userId": "550e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }
}
```

---

#### Process Data Room Document

Trigger AI processing to extract entities from a data room document.

**Endpoint:** `POST /api/dataroom/documents/:id/process`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `id` (string, required) - Data room document UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X POST http://localhost:5000/api/dataroom/documents/7n0o6679-7425-50no-k94l-o07pn1p90ko7/process \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "processingResult": {
      "documentId": "7n0o6679-7425-50no-k94l-o07pn1p90ko7",
      "status": "processed",
      "entitiesExtracted": 45,
      "entities": [
        {
          "type": "company_name",
          "value": "TechCo Inc.",
          "confidence": 0.98
        },
        {
          "type": "valuation",
          "value": "$10,000,000",
          "confidence": 0.92
        }
      ],
      "processedAt": "2025-01-18T12:01:30.000Z"
    }
  }
}
```

---

#### Delete Data Room Document

Remove a document from the data room and its extracted entities.

**Endpoint:** `DELETE /api/dataroom/documents/:id`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `id` (string, required) - Data room document UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X DELETE http://localhost:5000/api/dataroom/documents/7n0o6679-7425-50no-k94l-o07pn1p90ko7 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Data room document deleted successfully",
    "documentId": "7n0o6679-7425-50no-k94l-o07pn1p90ko7"
  }
}
```

---

### Knowledge Graph Endpoints (Planned)

Knowledge graph endpoints provide access to extracted entities and intelligent suggestions.

#### Get All Entities

Retrieve all entities in the user's knowledge graph.

**Endpoint:** `GET /api/knowledge-graph/entities`
**Authentication:** Required
**Status:** Planned

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Query Parameters

- `type` (string, optional) - Filter by entity type: "company" | "person" | "financial" | "date" | "address"
- `search` (string, optional) - Search entities by value

##### Example Request

```bash
curl -X GET "http://localhost:5000/api/knowledge-graph/entities?type=company" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "entities": [
      {
        "id": "8o1p7780-8536-61op-l05m-p18qo2q01lp8",
        "type": "company",
        "value": "TechCo Inc.",
        "confidence": 0.98,
        "sources": [
          "cap_table.xlsx",
          "incorporation_docs.pdf"
        ],
        "relationships": [
          {
            "relatedEntityId": "9p2q8891-9647-72pq-m16n-q29rp3r12mq9",
            "relationType": "has_investor",
            "confidence": 0.95
          }
        ],
        "metadata": {
          "jurisdiction": "Delaware",
          "incorporationDate": "2023-03-15"
        }
      }
    ]
  }
}
```

---

#### Get Suggestions for Placeholder

Get AI-powered suggestions for a specific placeholder based on knowledge graph.

**Endpoint:** `GET /api/knowledge-graph/suggestions/:placeholderId`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `placeholderId` (string, required) - Placeholder UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X GET http://localhost:5000/api/knowledge-graph/suggestions/9f1g8891-9647-62fg-c16d-g29he3h12cg9 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "placeholder": {
      "id": "9f1g8891-9647-62fg-c16d-g29he3h12cg9",
      "fieldName": "company_name",
      "fieldType": "text"
    },
    "suggestions": [
      {
        "value": "TechCo Inc.",
        "confidence": 0.98,
        "source": "data_room",
        "sourceDocuments": ["cap_table.xlsx", "incorporation_docs.pdf"],
        "reasoning": "Company name found in 2 data room documents with high confidence"
      },
      {
        "value": "TechCo Corporation",
        "confidence": 0.65,
        "source": "similar_documents",
        "sourceDocuments": ["previous_safe.docx"],
        "reasoning": "Alternative name used in similar document"
      }
    ]
  }
}
```

---

### Analytics Endpoints (Planned)

Analytics endpoints provide business intelligence and insights.

#### Get Dashboard Analytics

Retrieve high-level analytics for the user's dashboard.

**Endpoint:** `GET /api/analytics/dashboard`
**Authentication:** Required
**Status:** Planned

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Query Parameters

- `period` (string, optional) - Time period: "week" | "month" | "quarter" | "year" (default: "month")

##### Example Request

```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard?period=month" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2024-12-18",
    "endDate": "2025-01-18",
    "summary": {
      "documentsProcessed": 45,
      "averageHealthScore": 87,
      "timesSaved": "12.5 hours",
      "aiSuggestionsAccepted": 156,
      "aiSuggestionsRejected": 23
    },
    "documentsByType": [
      {
        "type": "SAFE Agreement",
        "count": 12
      },
      {
        "type": "NDA",
        "count": 18
      },
      {
        "type": "Employment Agreement",
        "count": 8
      }
    ],
    "trends": {
      "documentsPerDay": [
        { "date": "2025-01-15", "count": 3 },
        { "date": "2025-01-16", "count": 5 },
        { "date": "2025-01-17", "count": 2 }
      ]
    }
  }
}
```

---

#### Get Document Insights

Get AI-generated insights for a specific document.

**Endpoint:** `GET /api/analytics/documents/:id/insights`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `id` (string, required) - Document UUID

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X GET http://localhost:5000/api/analytics/documents/7c9e6679-7425-40de-944b-e07fc1f90ae7/insights \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "insights": {
      "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "healthScore": 92,
      "completionTime": "14 minutes",
      "comparisons": {
        "averageForType": {
          "healthScore": 85,
          "completionTime": "18 minutes"
        }
      },
      "highlights": [
        "All critical fields filled correctly",
        "Valuation cap aligned with market standards",
        "Discount rate within typical range (15-25%)"
      ],
      "warnings": [
        "Jurisdiction clause may need legal review"
      ],
      "suggestions": [
        "Consider adding investor rights provisions",
        "Review conversion mechanics for clarity"
      ],
      "riskAssessment": {
        "overall": "low",
        "factors": [
          {
            "factor": "Missing clauses",
            "risk": "low",
            "description": "All standard clauses present"
          },
          {
            "factor": "Unusual terms",
            "risk": "medium",
            "description": "Custom conversion trigger detected"
          }
        ]
      }
    }
  }
}
```

---

#### Get Company Analytics

Get analytics for all documents related to a specific company.

**Endpoint:** `GET /api/analytics/companies/:company/analytics`
**Authentication:** Required
**Status:** Planned

##### URL Parameters

- `company` (string, required) - Company name or identifier

##### Request Headers

```http
Authorization: Bearer <token>
```

##### Example Request

```bash
curl -X GET "http://localhost:5000/api/analytics/companies/TechCo%20Inc./analytics" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "company": "TechCo Inc.",
    "summary": {
      "totalDocuments": 8,
      "documentTypes": ["SAFE", "NDA", "Employment Agreement"],
      "averageHealthScore": 89,
      "lastActivity": "2025-01-18T11:45:00.000Z"
    },
    "documents": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "type": "SAFE Agreement",
        "status": "completed",
        "healthScore": 92,
        "completedDate": "2025-01-18T11:45:00.000Z"
      }
    ],
    "relationships": [
      {
        "type": "investor",
        "name": "Acme Ventures",
        "documentCount": 3
      },
      {
        "type": "employee",
        "name": "John Smith",
        "documentCount": 1
      }
    ],
    "insights": [
      "Consistent valuation cap of $10M across all SAFEs",
      "Standard 20% discount rate used in all rounds",
      "All NDAs include 2-year confidentiality period"
    ]
  }
}
```

---

## TypeScript Type Definitions

For TypeScript developers, here are the core type definitions:

```typescript
// Authentication
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: "lawyer" | "admin";
  organization?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organization?: string;
    createdAt?: string;
    lastLogin?: string;
  };
  token: string;
}

// Documents
enum DocumentStatus {
  UPLOADED = "uploaded",
  ANALYZING = "analyzing",
  READY = "ready",
  FILLING = "filling",
  COMPLETED = "completed"
}

interface Document {
  id: string;
  filename: string;
  filePath: string;
  uploadDate: string;
  status: DocumentStatus;
  documentType: string;
  aiClassificationConfidence?: number;
  riskScore?: number;
  completionPercentage: number;
  metadata?: Record<string, any>;
  userId: string;
}

// Placeholders
enum PlaceholderFieldType {
  TEXT = "text",
  DATE = "date",
  CURRENCY = "currency",
  NUMBER = "number",
  EMAIL = "email",
  ADDRESS = "address"
}

enum ValidationStatus {
  PENDING = "pending",
  VALIDATED = "validated",
  FLAGGED = "flagged"
}

interface Placeholder {
  id: string;
  documentId: string;
  fieldName: string;
  fieldType: PlaceholderFieldType;
  originalText: string;
  position: number;
  filledValue?: string;
  aiSuggestedValue?: string;
  suggestionSource?: string;
  confidence: number;
  validationStatus: ValidationStatus;
  validationNotes?: string;
}

// Standard API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## SDK Examples

### JavaScript/TypeScript Client

```typescript
import axios from 'axios';

class LexsyClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/auth/register`, data);
    this.token = response.data.data.token;
    return response.data.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email,
      password
    });
    this.token = response.data.data.token;
    return response.data.data;
  }

  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await axios.post(
      `${this.baseURL}/documents/upload`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data.data.document;
  }

  async getDocuments(): Promise<Document[]> {
    const response = await axios.get(`${this.baseURL}/documents`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.data.data.documents;
  }

  async analyzeDocument(documentId: string): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/documents/${documentId}/analyze`,
      {},
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    return response.data.data.analysis;
  }

  async extractPlaceholders(documentId: string): Promise<Placeholder[]> {
    const response = await axios.post(
      `${this.baseURL}/documents/${documentId}/placeholders`,
      {},
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    return response.data.data.placeholders;
  }
}

// Usage
const client = new LexsyClient();
await client.login('lawyer@example.com', 'SecurePass123!');

const documents = await client.getDocuments();
console.log(`You have ${documents.length} documents`);
```

### Python Client

```python
import requests
from typing import Optional, List, Dict

class LexsyClient:
    def __init__(self, base_url: str = "http://localhost:5000/api"):
        self.base_url = base_url
        self.token: Optional[str] = None

    def register(self, email: str, password: str, full_name: str,
                 role: str, organization: Optional[str] = None) -> Dict:
        response = requests.post(
            f"{self.base_url}/auth/register",
            json={
                "email": email,
                "password": password,
                "fullName": full_name,
                "role": role,
                "organization": organization
            }
        )
        response.raise_for_status()
        data = response.json()["data"]
        self.token = data["token"]
        return data

    def login(self, email: str, password: str) -> Dict:
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()["data"]
        self.token = data["token"]
        return data

    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}

    def upload_document(self, file_path: str) -> Dict:
        with open(file_path, 'rb') as f:
            files = {'document': f}
            response = requests.post(
                f"{self.base_url}/documents/upload",
                files=files,
                headers=self._headers()
            )
        response.raise_for_status()
        return response.json()["data"]["document"]

    def get_documents(self) -> List[Dict]:
        response = requests.get(
            f"{self.base_url}/documents",
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()["data"]["documents"]

    def analyze_document(self, document_id: str) -> Dict:
        response = requests.post(
            f"{self.base_url}/documents/{document_id}/analyze",
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()["data"]["analysis"]

# Usage
client = LexsyClient()
client.login("lawyer@example.com", "SecurePass123!")

documents = client.get_documents()
print(f"You have {len(documents)} documents")
```

---

## Webhooks (Future Feature)

Webhooks will allow you to receive real-time notifications about events in your Lexsy account.

### Planned Webhook Events

- `document.uploaded` - New document uploaded
- `document.analyzed` - Document analysis completed
- `document.placeholders_extracted` - Placeholders extracted
- `document.completed` - Document filling completed
- `conversation.started` - Conversation session started
- `conversation.completed` - Conversation session completed
- `dataroom.document_processed` - Data room document processed
- `conflict.detected` - Document conflict detected

### Webhook Payload Format

```json
{
  "event": "document.analyzed",
  "timestamp": "2025-01-18T11:45:00.000Z",
  "data": {
    "documentId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "documentType": "SAFE Agreement",
    "confidence": 0.95
  }
}
```

---

## Rate Limit Best Practices

To avoid hitting rate limits:

1. **Implement exponential backoff** when receiving 429 responses
2. **Cache responses** when appropriate
3. **Batch operations** when possible
4. **Monitor rate limit headers** and adjust request frequency
5. **Consider upgrading** to a higher tier for increased limits (future feature)

---

## Security Best Practices

1. **Never expose your JWT token** in client-side code or version control
2. **Use HTTPS** in production to encrypt all API traffic
3. **Rotate tokens regularly** by logging in periodically
4. **Validate file types** before uploading to avoid malicious files
5. **Implement CSRF protection** for browser-based applications
6. **Use environment variables** for sensitive configuration
7. **Monitor for unusual API activity** through logs

---

## Support and Resources

- **Documentation:** https://docs.lexsy.com (coming soon)
- **GitHub Issues:** https://github.com/lexsy/lexsy-platform/issues
- **Email Support:** support@lexsy.com
- **Status Page:** https://status.lexsy.com (coming soon)

---

## Changelog

### Version 1.0.0 (2025-01-18)

**Initial Release:**
- Authentication endpoints (register, login)
- Document management endpoints (upload, get, analyze, extract placeholders)
- JWT-based authentication
- Rate limiting
- Standardized error responses

**Planned Features:**
- Conversation endpoints for AI-powered filling
- Data room management
- Knowledge graph intelligence
- Analytics and insights
- Natural language search
- Multi-document synchronization
- Webhooks

---

## License

This API is proprietary and confidential. Unauthorized use is prohibited.

Copyright 2025 Lexsy Inc. All rights reserved.
