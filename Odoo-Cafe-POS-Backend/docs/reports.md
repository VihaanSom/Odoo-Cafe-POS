# Reports & Analytics API

Base URL: `/api/reports`

---

## GET `/api/reports/daily-sales`

Get sales summary for a specific day.

**Query:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| branchId | uuid | - | Filter by branch |
| date | string | today | Date (YYYY-MM-DD) |

**Response (200 OK):**

```json
{
  "date": "2026-01-24",
  "totalSales": 15000.0,
  "orderCount": 42
}
```

---

## GET `/api/reports/sales-range`

Get sales for a date range.

**Query:**
| Param | Required | Description |
|-------|----------|-------------|
| startDate | ✅ | Start date (YYYY-MM-DD) |
| endDate | ✅ | End date (YYYY-MM-DD) |
| branchId | ❌ | Filter by branch |

**Response (200 OK):**

```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "totalSales": 450000.0,
  "orderCount": 1250
}
```

---

## GET `/api/reports/top-products`

Get best-selling products.

**Query:**
| Param | Default | Description |
|-------|---------|-------------|
| branchId | - | Filter by branch |
| limit | 10 | Number of products |

**Response (200 OK):**

```json
[
  {
    "product": { "id": "...", "name": "Cappuccino", "price": "150.00" },
    "totalQuantity": 245
  },
  {
    "product": { "id": "...", "name": "Latte", "price": "180.00" },
    "totalQuantity": 198
  }
]
```

---

## GET `/api/reports/orders-by-status`

Get order count grouped by status.

**Query:** `?branchId=uuid` (optional)

**Response (200 OK):**

```json
[
  { "status": "COMPLETED", "count": 150 },
  { "status": "IN_PROGRESS", "count": 5 },
  { "status": "CREATED", "count": 3 }
]
```

---

## GET `/api/reports/hourly-sales`

Get sales breakdown by hour for a day.

**Query:**
| Param | Default | Description |
|-------|---------|-------------|
| branchId | - | Filter by branch |
| date | today | Date (YYYY-MM-DD) |

**Response (200 OK):**

```json
[
  { "hour": 8, "sales": 1200.0, "orders": 8 },
  { "hour": 9, "sales": 2500.0, "orders": 15 },
  { "hour": 10, "sales": 3200.0, "orders": 22 }
]
```
