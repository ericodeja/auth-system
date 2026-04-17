# Auth System

A comprehensive authentication and authorization system built with Express.js and MongoDB. Provides user registration, email verification, login with JWT tokens, password management, and account security features.

## Features

- **User Registration** — User signup with validation and email verification
- **Email Verification** — Verify email ownership with token-based confirmation
- **JWT Authentication** — Secure token-based authentication with access/refresh tokens
- **Multi-Factor Authentication (MFA)** — Enhanced security with TOTP (Google Authenticator, etc.)
- **Password Management** — Secure password hashing with bcrypt and recovery functionality
- **Rate Limiting** — API rate limiting to prevent brute force attacks
- **Account Locking** — Automatic account lock after failed login attempts
- **Email Service** — Email notifications via Resend
- **Error Handling** — Centralized error handling with custom error utilities
- **Logging** — Request/response logging with Winston and daily rotation
- **Input Validation** — Schema validation using Joi

## Tech Stack

- **Runtime** — Node.js with TypeScript
- **Framework** — Express.js
- **Database** — MongoDB with Mongoose ODM
- **Authentication** — JWT (jsonwebtoken), bcrypt, speakeasy (TOTP)
- **MFA QR Codes** — qrcode
- **Validation** — Joi
- **Email** — Resend
- **Rate Limiting** — express-rate-limit
- **Logging** — Winston with daily rotate file
- **Dev Tools** — Nodemon, tsx, TypeScript

## Project Structure

```
src/
├── app.ts                          # Express app setup
├── server.ts                       # Server entry point
├── config/                         # Configuration files
│   └── config.ts                   # Environment and app config
├── controllers/                    # Request handlers
│   ├── auth.controllers.ts         # Authentication endpoints
│   ├── mfa.controllers.ts          # MFA endpoints
│   └── token.controllers.ts        # Token management endpoints
├── db/                            # Database setup
│   └── mongodb.ts                 # MongoDB connection
├── middlewares/                    # Custom middleware
│   ├── authenticate.middleware.ts # Authentication check
│   ├── errorHandler.middleware.ts # Global error handler
│   ├── rateLimiter.middleware.ts  # Rate limiting
│   └── validate.middleware.ts     # Schema validation
├── models/                         # Database models
│   ├── user.model.ts              # User schema
│   └── token.model.ts             # Token schema
├── routes/                         # API routes
│   └── auth.routes.ts             # Combined authentication routes
├── services/                       # Business logic
│   ├── auth.services.ts           # Auth service layer
│   ├── mfa.services.ts            # MFA service layer
│   └── token.services.ts          # Token service layer
├── types/                          # TypeScript type definitions
│   ├── auth.types.ts              # Auth types
│   ├── config.types.ts            # Config types
│   └── index.ts                   # Exported types
├── utils/                          # Utility functions
│   ├── accountLock.utils.ts       # Account locking logic
│   ├── email.utils.ts             # Email sending
│   ├── http-error.utils.ts        # HTTP error handling
│   ├── logger.utils.ts            # Logger setup
│   ├── mfa.utils.ts               # MFA helpers
│   ├── password.utils.ts          # Password hashing/comparison
│   ├── token.utils.ts             # JWT token operations
│   └── user.utils.ts              # User retrieval helpers
└── validations/                    # Joi schemas
    └── auth.schema.ts             # Auth validation schemas
```

## Installation

```bash
# Clone the repository
git clone https://github.com/ericodeja/auth-system.git
cd auth-system

# Install dependencies
npm install

# Create .env file (configure MongoDB URI, JWT secret, Resend API key, etc.)
cp .env.example .env
```

## Running the Project

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## API Endpoints

### General Routes

#### `GET /`

Health check endpoint.

**Response (200):**

```json
"It works"
```

### Authentication Routes (`/auth/`)

#### `POST /auth/register`

Register a new user account with email verification.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "role": "user",
  "agreedToTerms": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User successfully created",
  "createEmailResponse": "Email dispatched",
  "data": {
    "unverifiedUser": {
      "_id": "65a4b8c9d1e2f3g4h5i6j7k8",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

**Error Responses:**

- `400 Bad Request` — Invalid input or user already exists
- `422 Unprocessable Entity` — Validation failed

---

#### `POST /auth/resend-email-verification-token/:id`

Resend email verification token to unverified user.

**URL Parameters:**

- `id` (string, required) — User ID

**Response (200):**

```json
{
  "success": true,
  "message": "Email Verification sent successfully"
}
```

**Error Responses:**

- `400 Bad Request` — Missing or invalid user ID
- `404 Not Found` — User does not exist

---

#### `POST /auth/verify-email/:emailVerificationToken`

Verify user email address using verification token.

**URL Parameters:**

- `emailVerificationToken` (string, required) — Email verification JWT token

**Response (201):**

```json
{
  "success": true,
  "message": "Email successfully verified",
  "data": {
    "response": {
      "verifiedUser": {
        "_id": "65a4b8c9d1e2f3g4h5i6j7k8",
        "email": "john.doe@example.com",
        "role": "user",
        "isVerified": true
      }
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` — Token is invalid or expired
- `404 Not Found` — Token does not exist or already used

---

#### `POST /auth/login`

Authenticate user and generate access/refresh tokens.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User successfully authenticated",
  "data": {
    "response": {
      "user": {
        "_id": "65a4b8c9d1e2f3g4h5i6j7k8",
        "email": "john.doe@example.com",
        "role": "user"
      },
      "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE0YjhjOWQxZTJmM2c0aDVpNmo3azgiLCJpYXQiOjE3MDUwMDAwMDB9.abcd1234efgh5678ijkl9012mnop3456",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE0YjhjOWQxZTJmM2c0aDVpNmo3azgiLCJpYXQiOjE3MDUwMDAwMDB9.wxyz7890abcd1234efgh5678ijkl9012mnop3456qrst"
      }
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` — Invalid email or password
- `423 Locked` — Account is locked due to failed login attempts
- `422 Unprocessable Entity` — Validation failed

---

#### `POST /auth/refresh`

Refresh access token using refresh token.

**Request Body:**

```json
{
  "oldRefreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE0YjhjOWQxZTJmM2c0aDVpNmo3azgiLCJpYXQiOjE3MDUwMDAwMDB9.wxyz7890abcd1234efgh5678ijkl9012mnop3456qrst"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "newTokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE0YjhjOWQxZTJmM2c0aDVpNmo3azgiLCJpYXQiOjE3MDUwMDAxMDB9.new1234efgh5678ijkl9012mnop3456abcd",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE0YjhjOWQxZTJmM2c0aDVpNmo3azgiLCJpYXQiOjE3MDUwMDAxMDB9.new7890abcd1234efgh5678ijkl9012mnop3456wxyz"
    }
  }
}
```

---

#### `GET /auth/getOtpAuthUrl`

Generate a TOTP secret and return a provisioning URL (suitable for QR code generation). Requires authentication.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "otpAuthUrl": "otpauth://totp/AuthSystem:john.doe@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AuthSystem"
  }
}
```

---

#### `POST /auth/enable-mfa`

Enable MFA for the authenticated user by verifying a token from their authenticator app.

**Request Body:**

```json
{
  "token": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "MFA successfully enabled"
}
```

---

#### `POST /auth/verify-mfa`

Verify an MFA token during secondary authentication (after login).

**Request Body:**

```json
{
  "token": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User successfully authenticated",
  "data": {
    "response": {
      "user": {
        "_id": "65a4b8c9d1e2f3g4h5i6j7k8",
        "email": "john.doe@example.com",
        "role": "user"
      },
      "tokens": {
        "accessToken": "...",
        "refreshToken": "..."
      }
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` — Token is invalid or expired
- `403 Forbidden` — Invalid or reused refresh token; account locked
- `422 Unprocessable Entity` — Validation failed

## Environment Variables

```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
RESEND_API_KEY=<your-resend-api-key>
NODE_ENV=development
PORT=3000
```

## Security Features

- **Password Hashing** — Bcrypt for secure password storage
- **JWT Tokens** — Access and refresh token system with configurable expiration
- **Rate Limiting** — Prevents brute force attacks on auth endpoints
- **Account Locking** — Locks account after multiple failed login attempts
- **Input Validation** — Joi schema validation on all requests
- **Error Handling** — Generic error messages to prevent information leakage
