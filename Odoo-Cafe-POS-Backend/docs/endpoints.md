# Odoo Cafe POS - Authentication API

## Base URL

```
http://localhost:5000/api
```

---

## Endpoints

### POST `/auth/signup`

Creates a new user account and returns a JWT token.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

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

**Error Response (409 Conflict):**

```json
{
  "message": "User already exists"
}
```

---

### POST `/auth/login`

Authenticates an existing user and returns a JWT token.

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

**Error Response (401 Unauthorized):**

```json
{
  "message": "Invalid credentials"
}
```

---

### GET `/auth/me`

Returns the currently authenticated user's profile.

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

**Error Response (401 Unauthorized):**

```json
{
  "message": "Unauthorized"
}
```

---

## Quick Reference

| Endpoint       | Method | Description                              |
| -------------- | ------ | ---------------------------------------- |
| `/auth/signup` | POST   | Register a new user account              |
| `/auth/login`  | POST   | Authenticate and get JWT token           |
| `/auth/me`     | GET    | Get current user profile (requires auth) |
