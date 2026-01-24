# Products API

Base URL: `/api/products`

---

## POST `/api/products`

Creates a new product.

**Request:**

```json
{
  "branchId": "7edbac81-f6dd-4506-xxxx-xxxxxxxxxxxx",
  "categoryId": "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "Cappuccino",
  "price": 150.0
}
```

| Field      | Type          | Required | Description                    |
| ---------- | ------------- | -------- | ------------------------------ |
| branchId   | string (UUID) | ✅       | Branch this product belongs to |
| categoryId | string (UUID) | ❌       | Category for the product       |
| name       | string        | ✅       | Product name                   |
| price      | number        | ✅       | Product price (Decimal)        |

**Response (201 Created):**

```json
{
  "id": "prod-uuid-xxxx",
  "branchId": "7edbac81-...",
  "categoryId": "a1b2c3d4-...",
  "name": "Cappuccino",
  "price": "150.00",
  "isActive": true,
  "category": { "id": "...", "name": "Beverages" },
  "branch": { "id": "...", "name": "Main Street" }
}
```

---

## GET `/api/products`

Returns all products. Supports filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| branchId | string | Filter by branch |
| categoryId | string | Filter by category |
| isActive | boolean | Filter by active status |

**Example:** `GET /api/products?branchId=xxx&isActive=true`

**Response (200 OK):**

```json
[
  {
    "id": "prod-uuid-xxxx",
    "name": "Cappuccino",
    "price": "150.00",
    "isActive": true,
    "category": { "id": "...", "name": "Beverages" },
    "branch": { "id": "...", "name": "Main Street" }
  }
]
```

---

## GET `/api/products/:id`

Returns a single product by ID.

**Response (200 OK):**

```json
{
  "id": "prod-uuid-xxxx",
  "name": "Cappuccino",
  "price": "150.00",
  "isActive": true,
  "category": { "id": "...", "name": "Beverages" },
  "branch": { "id": "...", "name": "Main Street" }
}
```

**Error (404):** `{ "message": "Product not found" }`

---

## PUT `/api/products/:id`

Updates a product.

**Request:**

```json
{
  "name": "Double Cappuccino",
  "price": 200.0,
  "isActive": false
}
```

All fields are optional.

**Response (200 OK):** Updated product object

**Error (404):** `{ "message": "Product not found" }`

---

## DELETE `/api/products/:id`

Deletes a product.

**Response (204 No Content):** Empty body

**Error (404):** `{ "message": "Product not found" }`
