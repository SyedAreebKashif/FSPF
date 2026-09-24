# Production-Ready Node.js Express TypeScript MongoDB Backend

A production-ready, highly modular RESTful backend built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB (Mongoose)**. It incorporates enterprise-grade architecture, strict validation, centralized error handling, JWT authentication, security best practices, and automated tests.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # MongoDB connection setup with retry logic & event listeners
│   │   └── env.ts             # Environment variable schema validation via Zod
│   │
│   ├── models/
│   │   └── user.model.ts      # Mongoose schema, validation, bcrypt pre-save hook, methods
│   │
│   ├── controllers/
│   │   └── user.controller.ts # Request handlers & Zod input validation
│   │
│   ├── routes/
│   │   ├── index.ts           # Route aggregator & /health check
│   │   └── user.routes.ts     # User endpoints (register, login, profile, CRUD)
│   │
│   ├── middlewares/
│   │   ├── error.middleware.ts     # Global error handling (Mongoose, JWT, 400, 500)
│   │   ├── auth.middleware.ts      # Bearer JWT verification & role-based authorization
│   │   └── notFound.middleware.ts  # 404 handler for undefined routes
│   │
│   ├── services/
│   │   └── user.service.ts    # Database queries and reusable business logic
│   │
│   ├── utils/
│   │   ├── asyncHandler.ts    # Async wrapper to forward errors to error middleware
│   │   └── apiError.ts        # Custom operational error class
│   │
│   ├── types/
│   │   └── index.d.ts         # Global TypeScript types & Express Request augmentation
│   │
│   ├── app.ts                 # Express application configuration & middleware pipeline
│   └── server.ts              # Server startup, DB connection, & graceful shutdown
│
├── dist/                      # Compiled JavaScript output (generated on build)
├── tests/                     # Integration tests with Jest & Supertest
│   ├── setup.ts               # MongoMemoryServer in-memory test environment
│   └── auth.test.ts           # Authentication, profile, and edge-case tests
├── .env                       # Local environment variables
├── .env.example               # Template for environment variables
├── .gitignore                 # Files excluded from git
├── jest.config.ts             # Jest testing configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript compiler settings
└── README.md                  # Project documentation
```

---

## ⚡ Features & Production Best Practices

- **Strict TypeScript**: Fully typed request parameters, response bodies, models, and environment variables.
- **Fail-Fast Environment Validation**: Zod parses and validates all required environment variables on startup.
- **Security Protections**:
  - `helmet`: Protects against well-known web vulnerabilities with HTTP headers.
  - `cors`: Configurable allowed origins.
  - `express-rate-limit`: Mitigates brute-force and DoS attacks.
  - `bcryptjs`: Passwords hashed with salt rounds before storing in DB.
  - `select: false`: Passwords excluded from query projections by default.
  - Request body payload size limits (`16kb`) to prevent large payload attacks.
- **Resilient MongoDB Connection**:
  - Auto-reconnection and exponential retry logic.
  - Event monitoring (`connected`, `error`, `disconnected`).
  - Isolated in-memory database (`mongodb-memory-server`) for tests.
- **Graceful Shutdown**: Handles `SIGTERM`, `SIGINT`, `unhandledRejection`, and `uncaughtException` cleanly by closing HTTP listeners and disconnecting MongoDB safely.
- **Centralized Error Handling**:
  - Automatically translates Mongoose `CastError` (invalid ObjectId) to `400 Bad Request`.
  - Automatically translates MongoServerError `E11000` (duplicate keys) to `409 Conflict`.
  - Automatically translates Mongoose `ValidationError` to `400 Bad Request`.
  - Distinguishes between operational errors and unexpected crashes (masks internal details in production).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 1. Installation

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `PORT` | HTTP Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/portfolio_db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | *Required (min 16 chars)* |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CORS_ORIGIN` | Comma-separated list or `*` for all origins | `*` |

### 3. Running the Server

#### Development Mode (with hot-reload via `tsx`):
```bash
npm run dev
```

#### Production Build & Run:
```bash
npm run build
npm start
```

---

## 🧪 Testing

The test suite runs against an isolated, in-memory MongoDB server using Jest and Supertest. No external MongoDB service is required.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with code coverage report
npm run test:coverage
```

---

## 📡 API Endpoints

### Base URL: `/api/v1`

#### 1. System Health
- **`GET /api/v1/health`**
  - **Access**: Public
  - **Response (200)**:
    ```json
    {
      "success": true,
      "message": "Backend server is running smoothly",
      "timestamp": "2026-09-24T09:00:00.000Z",
      "uptime": 12.34
    }
    ```

#### 2. Authentication & Users
- **`POST /api/v1/users/register`**
  - **Access**: Public
  - **Body**:
    ```json
    {
      "name": "Alex Smith",
      "email": "alex@example.com",
      "password": "Password123!"
    }
    ```
  - **Response (201)**:
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "user": {
          "_id": "651a2b3c4d5e6f7a8b9c0d1e",
          "name": "Alex Smith",
          "email": "alex@example.com",
          "role": "user",
          "createdAt": "2026-09-24T09:00:00.000Z",
          "updatedAt": "2026-09-24T09:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

- **`POST /api/v1/users/login`**
  - **Access**: Public
  - **Body**:
    ```json
    {
      "email": "alex@example.com",
      "password": "Password123!"
    }
    ```
  - **Response (200)**: Returns user and token.

- **`GET /api/v1/users/me`**
  - **Access**: Protected (`Authorization: Bearer <token>`)
  - **Response (200)**: Current user's profile.

- **`PUT /api/v1/users/me`**
  - **Access**: Protected (`Authorization: Bearer <token>`)
  - **Body** (any of):
    ```json
    {
      "name": "Alex Updated",
      "bio": "Senior Full-Stack Engineer",
      "avatar": "https://example.com/avatar.png",
      "password": "NewSecretPassword456!"
    }
    ```
  - **Response (200)**: Updated profile object.

- **`DELETE /api/v1/users/me`**
  - **Access**: Protected (`Authorization: Bearer <token>`)
  - **Response (200)**: Confirmation of account deletion.

- **`GET /api/v1/users`**
  - **Access**: Protected (`Authorization: Bearer <token>`)
  - **Query Params**: `?page=1&limit=10`
  - **Response (200)**: Paginated user list.

- **`GET /api/v1/users/:id`**
  - **Access**: Protected (`Authorization: Bearer <token>`)
  - **Response (200)**: User profile by ID.

---

## 🛡️ Standard Error Response Format

All errors return a predictable JSON payload:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid registration data",
  "errors": [
    "email: Invalid email address format",
    "password: Password must be at least 6 characters long"
  ]
}
```
