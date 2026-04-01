const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getActiveOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

// GET  /api/orders        — list all (supports ?status=, ?limit=)
// POST /api/orders        — place new order (checkout)
router.route("/").get(getAllOrders).post(createOrder);

// GET /api/orders/active  — kitchen dashboard shortcut (must be before /:id)
router.get("/active", getActiveOrders);

// GET /api/orders/:id     — get by MongoDB _id or order_id string
router.get("/:id", getOrderById);

// PUT /api/orders/:id/status — advance order status
router.put("/:id/status", updateOrderStatus);

module.exports = router;
