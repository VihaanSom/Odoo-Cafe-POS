# Tables API

Base URL: `/api/tables`

---

## POST `/api/tables`

Creates a new table.

**Request:**

```json
{
  "floorId": "floor-uuid",
  "tableNumber": 1
}
```

| Field       | Type          | Required | Description                 |
| ----------- | ------------- | -------- | --------------------------- |
| floorId     | string (UUID) | ✅       | Floor this table belongs to |
| tableNumber | integer       | ✅       | Table number                |

**Response (201 Created):**

```json
{
  "id": "table-uuid",
  "floorId": "floor-uuid",
  "tableNumber": 1,
  "status": "FREE",
  "floor": { "id": "...", "name": "Ground Floor" }
}
```

---

## GET `/api/tables`

Returns all tables. Optionally filter by floor.

**Query:** `?floorId=uuid`

**Response (200 OK):**

```json
[
  {
    "id": "table-uuid",
    "tableNumber": 1,
    "status": "FREE",
    "floor": { "id": "...", "name": "Ground Floor" }
  }
]
```

---

## GET `/api/tables/:id`

Returns a single table by ID.

**Response (200 OK):** Table object with floor

**Error (404):** `{ "message": "Table not found" }`

---

## PUT `/api/tables/:id`

Updates a table.

**Request:**

```json
{
  "tableNumber": 5,
  "status": "OCCUPIED"
}
```

| Field       | Type    | Description          |
| ----------- | ------- | -------------------- |
| tableNumber | integer | New table number     |
| status      | string  | `FREE` or `OCCUPIED` |

**Response (200 OK):** Updated table object

---

## PATCH `/api/tables/:id/status`

Updates table status only.

**Request:**

```json
{
  "status": "OCCUPIED"
}
```

**Valid statuses:** `FREE`, `OCCUPIED`

**Response (200 OK):** Updated table object

---

## DELETE `/api/tables/:id`

Deletes a table.

**Response (204 No Content):** Empty body
