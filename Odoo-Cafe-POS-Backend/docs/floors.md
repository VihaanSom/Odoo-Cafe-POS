# Floors API

Base URL: `/api/floors`

---

## POST `/api/floors`

Creates a new floor.

**Request:**

```json
{
  "branchId": "uuid",
  "name": "Ground Floor"
}
```

| Field    | Type          | Required | Description                  |
| -------- | ------------- | -------- | ---------------------------- |
| branchId | string (UUID) | ✅       | Branch this floor belongs to |
| name     | string        | ✅       | Floor name                   |

**Response (201 Created):**

```json
{
  "id": "floor-uuid",
  "branchId": "branch-uuid",
  "name": "Ground Floor",
  "branch": { "id": "...", "name": "Main Street" }
}
```

---

## GET `/api/floors`

Returns all floors. Optionally filter by branch.

**Query:** `?branchId=uuid`

**Response (200 OK):**

```json
[
  {
    "id": "floor-uuid",
    "name": "Ground Floor",
    "branch": { "id": "...", "name": "Main Street" },
    "tables": [{ "id": "...", "tableNumber": 1, "status": "FREE" }]
  }
]
```

---

## GET `/api/floors/:branchId/layout`

Returns floor plan with tables for POS frontend.

**Response (200 OK):**

```json
[
  {
    "id": "floor-uuid",
    "name": "Ground Floor",
    "tables": [
      { "id": "...", "tableNumber": 1, "status": "FREE" },
      { "id": "...", "tableNumber": 2, "status": "OCCUPIED" }
    ]
  }
]
```

---

## GET `/api/floors/:id`

Returns a single floor by ID.

**Response (200 OK):** Floor object with branch and tables

**Error (404):** `{ "message": "Floor not found" }`

---

## PUT `/api/floors/:id`

Updates a floor.

**Request:** `{ "name": "First Floor" }`

**Response (200 OK):** Updated floor object

---

## DELETE `/api/floors/:id`

Deletes a floor.

**Response (204 No Content):** Empty body
