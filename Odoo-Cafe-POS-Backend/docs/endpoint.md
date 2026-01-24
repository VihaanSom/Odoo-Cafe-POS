# Session Management API Endpoints

Base URL: `http://localhost:5000/api`

> **Note:** All session endpoints require authentication. Include the JWT token in the `Authorization` header:
> ```
> Authorization: Bearer <your_jwt_token>
> ```

---

## Prerequisites

Before testing session endpoints, you need:
1. A registered user (use `/api/auth/signup`)
2. A JWT token (from login response)
3. A POS Terminal in the database

### Create a Test Terminal (via Prisma Studio or SQL)

Run Prisma Studio:
```bash
npx prisma studio
```

Then create a `PosTerminal` record with:
- `terminalName`: "Counter 1"
- Copy the generated `id` (UUID) for testing

---

## Endpoints

### 1. Open Session

**POST** `/api/sessions/open`

Opens a new POS session for a terminal. A terminal can only have one active session at a time.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "terminalId": "<terminal-uuid>"
}
```

**Success Response (201):**
```json
{
  "session": {
    "id": "uuid",
    "terminalId": "uuid",
    "openedAt": "2026-01-24T14:00:00.000Z",
    "closedAt": null,
    "totalSales": "0",
    "terminal": {
      "id": "uuid",
      "terminalName": "Counter 1"
    }
  }
}
```

**Error Responses:**
- `400` - Terminal already has an active session
- `404` - Terminal not found

---

### 2. Get Active Sessions

**GET** `/api/sessions/active`

Returns all currently open (unclosed) sessions.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "terminalId": "uuid",
      "openedAt": "2026-01-24T14:00:00.000Z",
      "closedAt": null,
      "totalSales": "0",
      "terminal": {
        "id": "uuid",
        "terminalName": "Counter 1"
      }
    }
  ]
}
```

---

### 3. Get Session by ID

**GET** `/api/sessions/:id`

Returns a specific session with its orders.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "session": {
    "id": "uuid",
    "terminalId": "uuid",
    "openedAt": "2026-01-24T14:00:00.000Z",
    "closedAt": null,
    "totalSales": "0",
    "terminal": { ... },
    "orders": [ ... ]
  }
}
```

**Error Responses:**
- `404` - Session not found

---

### 4. Close Session

**POST** `/api/sessions/:id/close`

Closes an active session. Automatically calculates `totalSales` from all orders in the session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (empty)
```json
{}
```

**Success Response (200):**
```json
{
  "session": {
    "id": "uuid",
    "terminalId": "uuid",
    "openedAt": "2026-01-24T14:00:00.000Z",
    "closedAt": "2026-01-24T22:00:00.000Z",
    "totalSales": "5000.00",
    "terminal": { ... }
  }
}
```

**Error Responses:**
- `400` - Session is already closed
- `404` - Session not found

---

## Postman Testing Steps

### Step 1: Login to get JWT token
1. **POST** `http://localhost:5000/api/auth/login`
2. Body:
   ```json
   {
     "email": "your@email.com",
     "password": "yourpassword"
   }
   ```
3. Copy the `token` from response

### Step 2: Create a Terminal (via Prisma Studio)
1. Run `npx prisma studio` in the backend folder
2. Go to `PosTerminal` table
3. Click "Add record"
4. Fill in `terminalName` (e.g., "Counter 1")
5. Save and copy the `id`

### Step 3: Open a Session
1. **POST** `http://localhost:5000/api/sessions/open`
2. Headers:
   - `Authorization`: `Bearer <your_token>`
   - `Content-Type`: `application/json`
3. Body:
   ```json
   {
     "terminalId": "<terminal-uuid-from-step-2>"
   }
   ```
4. Copy the session `id` from response

### Step 4: Get Active Sessions
1. **GET** `http://localhost:5000/api/sessions/active`
2. Headers:
   - `Authorization`: `Bearer <your_token>`
3. Verify your session appears in the list

### Step 5: Get Session Details
1. **GET** `http://localhost:5000/api/sessions/<session-id>`
2. Headers:
   - `Authorization`: `Bearer <your_token>`
3. Verify session details are returned


### Step 6: Close the Session
1. **POST** `http://localhost:5000/api/sessions/<session-id>/close`
2. Headers:
   - `Authorization`: `Bearer <your_token>`
3. Verify `closedAt` is now set and `totalSales` is calculated

---

## Terminal API Endpoints (New)

Base URL: `http://localhost:5000/api`

> **Note:** All terminal endpoints require authentication.

### 1. Create Terminal

**POST** `/api/terminals`

Creates a new POS terminal.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "terminalName": "Bar Counter",
  "branchId": "dcf3925f-c9e6-476a-b714-01178f847c7f" 
}
```
*(Branch ID is optional but recommended if you have created a branch)*

**Success Response (201):**
```json
{
  "terminal": {
    "id": "new-uuid",
    "terminalName": "Bar Counter",
    "branchId": "..."
  }
}
```

---

### 2. Get All Terminals

**GET** `/api/terminals`

Returns all terminals with their current branch details.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "terminals": [
    {
      "id": "uuid",
      "terminalName": "Counter 1",
      "branch": { ... }
    }
  ]
}
```

---

## Postman Testing Steps (Terminals)

### Step 1: Login (if not already logged in)
1. **POST** `http://localhost:5000/api/auth/login`
2. Body: `{ "email": "admin_...@odoocafe.com", "password": "password123" }`
3. Copy `token`

### Step 2: Create a New Terminal
1. **POST** `http://localhost:5000/api/terminals`
2. Headers: `Authorization: Bearer <token>`
3. Body:
   ```json
   {
     "terminalName": "Terrace Bar",
     "branchId": "dcf3925f-c9e6-476a-b714-01178f847c7f"
   }
   ```
4. Verify response contains the new terminal ID

### Step 3: Verify Terminal List
1. **GET** `http://localhost:5000/api/terminals`
2. Headers: `Authorization: Bearer <token>`
3. Check if "Terrace Bar" appears in the list
