# Canteen Quick Order — Backend (MERN)

Express + MongoDB REST API for the Canteen Quick Order frontend.

---

## Project Structure

```
canteen-backend/
├── config/
│   └── db.js                  # Mongoose connection
├── controllers/
│   ├── menuController.js      # Menu CRUD + stock adjustment
│   └── orderController.js     # Checkout, listing, status transitions
├── middleware/
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── MenuItem.js            # Mongoose schema for menu items
│   └── Order.js               # Mongoose schema for orders
├── routes/
│   ├── menuRoutes.js
│   └── orderRoutes.js
├── scripts/
│   └── seed.js                # Populates DB with the 12 default menu items
├── .env.example
├── package.json
└── server.js                  # Entry point
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 2. Install dependencies

```bash
cd canteen-backend
npm install
```

### 3. Configure environment

```bash
cp .env .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://localhost:27017   # or your Atlas URI
DB_NAME=canteen_db
PORT=5000
CLIENT_URL=http://localhost:5173      # your Vite dev server
```

### 4. Seed the database

Populates MongoDB with all 12 default menu items from the frontend:

```bash
npm run seed
```

### 5. Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`.

---

## API Reference

### Health

| Method | Path         | Description      |
|--------|--------------|------------------|
| GET    | /api/health  | Liveness check   |

### Menu — `/api/menu`

| Method | Path                    | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | /api/menu               | List all items (`?category=`)      |
| GET    | /api/menu/:id           | Get single item                    |
| POST   | /api/menu               | Create item (admin)                |
| PUT    | /api/menu/:id           | Update item (admin)                |
| PATCH  | /api/menu/:id/stock     | Adjust stock by `delta`            |
| DELETE | /api/menu/:id           | Delete item (admin)                |

**PATCH /api/menu/:id/stock body:**
```json
{ "delta": -2 }   // negative = consume, positive = restock
```

### Orders — `/api/orders`

| Method | Path                    | Description                               |
|--------|-------------------------|-------------------------------------------|
| GET    | /api/orders             | All orders (`?status=Placed,Preparing`)   |
| GET    | /api/orders/active      | Non-completed orders (kitchen dashboard)  |
| GET    | /api/orders/:id         | Get by MongoDB _id or order_id string     |
| POST   | /api/orders             | Place order (checkout)                    |
| PUT    | /api/orders/:id/status  | Advance order status (kitchen)            |

**POST /api/orders body:**
```json
{
  "items": [
    { "menuItemId": "<MongoDB _id>", "quantity": 2 },
    { "menuItemId": "<MongoDB _id>", "quantity": 1 }
  ],
  "customerNote": "No onions please"
}
```

**PUT /api/orders/:id/status body:**
```json
{ "status": "Preparing" }
```

Valid transitions: `Placed → Preparing → Ready → Completed`

---

## Frontend Integration

### 1. Update frontend `.env`

In the `canteen-quick-order-main` root:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Replace two source files

| Old file                                | Replace with (from `canteen-frontend-updates/`) |
|-----------------------------------------|-------------------------------------------------|
| `src/services/canteenService.ts`        | `src/services/canteenService.ts`                |
| `src/context/CanteenContext.tsx`        | `src/context/CanteenContext.tsx`                |

That's it — no other frontend changes needed.

### What changes in the frontend?

| Feature                         | Before (local state)         | After (MERN backend)                    |
|---------------------------------|------------------------------|-----------------------------------------|
| Menu data                       | Hardcoded in service file    | Fetched from `GET /api/menu`            |
| Stock validation on checkout    | In-memory, resets on refresh | Atomic DB transaction, persists         |
| Order creation                  | Local state only             | Persisted in MongoDB                    |
| Kitchen queue                   | Same browser session only    | Shared across all clients, polls every 15 s |
| Order status updates            | Local state                  | Persisted via `PUT /api/orders/:id/status` |

---

## Data Models

### MenuItem
```
id, name, price, description, image_url,
stock, category, isAvailable, createdAt, updatedAt
```
Categories: `Main Course | Snacks | Beverages | Desserts`

### Order
```
order_id (ORD-XXXXX-XXXX), items[], subtotal,
tax, total, status, timestamp, customerNote
```
Statuses: `Placed → Preparing → Ready → Completed`

---

## Deployment Tips

- **MongoDB Atlas**: Replace `MONGO_URI` with your Atlas connection string. The `dbName` option in `config/db.js` sets the database name independently.
- **Render / Railway / Fly.io**: Set environment variables via the platform dashboard; `npm start` is the start command.
- **CORS**: Update `CLIENT_URL` to your deployed frontend URL (e.g. `https://your-app.vercel.app`).
