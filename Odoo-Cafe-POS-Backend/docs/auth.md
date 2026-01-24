# Authentication API

Base URL: `/api/auth`

---

## POST `/api/auth/signup`

Register a new user account.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field    | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| name     | string | ✅       | User's full name      |
| email    | string | ✅       | User's email (unique) |
| password | string | ✅       | Min 6 characters      |

**Response (201 Created):**

```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-24T11:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (409 Conflict):**

```json
{
  "message": "User already exists"
}
```

---

## POST `/api/auth/login`

Authenticate and get JWT token.

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-24T11:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401 Unauthorized):**

```json
{
  "message": "Invalid credentials"
}
```

---

## GET `/api/auth/me`

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-24T11:00:00.000Z"
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "message": "Unauthorized"
}
```
