# Categories API

Base URL: `/api/categories`

---

## POST `/api/categories`

Creates a new category for a branch.

**Request:**

```json
{
  "branchId": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "name": "Beverages"
}
```

| Field    | Type          | Required | Description                     |
| -------- | ------------- | -------- | ------------------------------- |
| branchId | string (UUID) | ✅       | Branch this category belongs to |
| name     | string        | ✅       | Category name                   |

**Response (201 Created):**

```json
{
  "id": "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "branchId": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "name": "Beverages"
}
```

**Error (404 Not Found):**

```json
{
  "message": "Branch not found"
}
```

---

## GET `/api/categories`

Returns all categories. Optionally filter by branch.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| branchId | string | ❌ | Filter by branch ID |

**Example:** `GET /api/categories?branchId=7edbac81-...`

**Response (200 OK):**

```json
[
  {
    "id": "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "branchId": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
    "name": "Beverages",
    "branch": {
      "id": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
      "name": "Main Street Outlet"
    }
  }
]
```

---

## GET `/api/categories/:id`

Returns a single category by ID.

**Response (200 OK):**

```json
{
  "id": "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "branchId": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "name": "Beverages",
  "branch": {
    "id": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
    "name": "Main Street Outlet"
  }
}
```

**Error (404 Not Found):**

```json
{
  "message": "Category not found"
}
```

---

## PUT `/api/categories/:id`

Updates a category.

**Request:**

```json
{
  "name": "Hot Beverages"
}
```

**Response (200 OK):**

```json
{
  "id": "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "branchId": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "name": "Hot Beverages"
}
```

**Error (404 Not Found):**

```json
{
  "message": "Category not found"
}
```

---

## DELETE `/api/categories/:id`

Deletes a category.

**Response (204 No Content):** Empty body

**Error (404 Not Found):**

```json
{
  "message": "Category not found"
}
```
