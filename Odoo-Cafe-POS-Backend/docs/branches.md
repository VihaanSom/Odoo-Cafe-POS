# Branches API

Base URL: `/api/branches`

---

## POST `/api/branches`

Creates a new branch.

**Request:**

```json
{
  "name": "Main Street Outlet",
  "address": "123 Food St"
}
```

| Field   | Type   | Required | Description    |
| ------- | ------ | -------- | -------------- |
| name    | string | ✅       | Branch name    |
| address | string | ❌       | Branch address |

**Response (201 Created):**

```json
{
  "id": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "name": "Main Street Outlet",
  "address": "123 Food St",
  "createdAt": "2026-01-24T13:30:00.000Z"
}
```

---

## GET `/api/branches`

Returns all branches.

**Request:** None

**Response (200 OK):**

```json
[
  {
    "id": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
    "name": "Main Street Outlet",
    "address": "123 Food St",
    "createdAt": "2026-01-24T13:30:00.000Z"
  }
]
```

---

## GET `/api/branches/:id`

Returns a single branch by ID.

**Request:** None (ID in URL)

**Response (200 OK):**

```json
{
  "id": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "name": "Main Street Outlet",
  "address": "123 Food St",
  "createdAt": "2026-01-24T13:30:00.000Z"
}
```

**Error (404 Not Found):**

```json
{
  "message": "Branch not found"
}
```

---

## PUT `/api/branches/:id`

Updates a branch.

**Request:**

```json
{
  "name": "Downtown Cafe",
  "address": "456 New Address"
}
```

**Response (200 OK):**

```json
{
  "id": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "name": "Downtown Cafe",
  "address": "456 New Address",
  "createdAt": "2026-01-24T13:30:00.000Z"
}
```

---

## DELETE `/api/branches/:id`

Deletes a branch.

**Request:** None (ID in URL)

**Response (204 No Content):** Empty body
