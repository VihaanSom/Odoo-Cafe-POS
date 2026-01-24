# Odoo Cafe POS - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## API Routes

| Module     | Base Path         | Documentation                    |
| ---------- | ----------------- | -------------------------------- |
| Auth       | `/api/auth`       | [auth.md](./auth.md)             |
| Branches   | `/api/branches`   | [branches.md](./branches.md)     |
| Categories | `/api/categories` | [categories.md](./categories.md) |
| Products   | `/api/products`   | [products.md](./products.md)     |
| Floors     | `/api/floors`     | [floors.md](./floors.md)         |
| Tables     | `/api/tables`     | [tables.md](./tables.md)         |
| Sessions   | `/api/sessions`   | [sessions.md](./sessions.md)     |
| Orders     | `/api/orders`     | [orders.md](./orders.md)         |
| Payments   | `/api/payments`   | [payments.md](./payments.md)     |
| Kitchen    | `/api/kitchen`    | [kitchen.md](./kitchen.md)       |
| Reports    | `/api/reports`    | [reports.md](./reports.md)       |

---

## Error Response Format

All errors follow this format:

```json
{
  "message": "Error description here"
}
```

## Common HTTP Status Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | Success                        |
| 201  | Created                        |
| 204  | No Content (successful delete) |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized                   |
| 404  | Not Found                      |
| 409  | Conflict (duplicate)           |
| 500  | Server Error                   |
