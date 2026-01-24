# Kitchen Display System (KDS) API

Base URL: `/api/kitchen`

---

## GET `/api/kitchen/orders`

Returns all active orders for the kitchen display.

**Query:** `?branchId=uuid` (optional)

Active orders have status: `CREATED` or `IN_PROGRESS`

**Response (200 OK):**

```json
[
  {
    "id": "order-uuid",
    "orderType": "DINE_IN",
    "status": "CREATED",
    "totalAmount": "450.00",
    "createdAt": "2026-01-24T17:00:00.000Z",
    "table": { "id": "...", "tableNumber": 5 },
    "orderItems": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "priceAtTime": "150.00",
        "product": { "id": "...", "name": "Cappuccino" }
      }
    ],
    "creator": { "id": "...", "name": "John" }
  }
]
```

---

## GET `/api/kitchen/ready`

Returns orders that are ready for serving.

**Query:** `?branchId=uuid` (optional)

**Response (200 OK):** Array of orders with status `READY`

---

## PATCH `/api/kitchen/orders/:id/status`

Updates order status with transition validation.

**Request:**

```json
{
  "status": "IN_PROGRESS"
}
```

**Valid Transitions:**
| From | To |
|------|-----|
| CREATED | IN_PROGRESS |
| IN_PROGRESS | READY |
| READY | COMPLETED |

**Response (200 OK):** Updated order object

**Error (400 Bad Request):**

```json
{
  "message": "Invalid status transition: CREATED → READY"
}
```

---

## POST `/api/kitchen/orders/:id/start`

Shortcut to start cooking an order.

Changes status: `CREATED` → `IN_PROGRESS`

**Request:** None (empty body)

**Response (200 OK):** Updated order object

---

## POST `/api/kitchen/orders/:id/ready`

Shortcut to mark order as ready.

Changes status: `IN_PROGRESS` → `READY`

**Request:** None (empty body)

**Response (200 OK):** Updated order object
