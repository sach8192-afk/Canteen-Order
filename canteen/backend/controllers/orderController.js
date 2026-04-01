const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

const TAX_RATE = 0.05;

const generateOrderId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

const calculateBill = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  return { subtotal, tax, total: subtotal + tax };
};

// POST /api/orders
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, customerNote } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    const itemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } }).session(session);

    if (menuItems.length !== itemIds.length) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "One or more menu items not found" });
    }

    const cartItems = [];
    for (const reqItem of items) {
      const menuItem = menuItems.find((m) => m._id.toString() === reqItem.menuItemId);
      if (!menuItem) {
        await session.abortTransaction();
        return res.status(404).json({ success: false, message: `Item ${reqItem.menuItemId} not found` });
      }
      if (menuItem.stock < reqItem.quantity) {
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for "${menuItem.name}". Available: ${menuItem.stock}`,
        });
      }

      cartItems.push({
        menuItem: {
          id: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price,
          description: menuItem.description,
          image_url: menuItem.image_url,
          stock: menuItem.stock,
          category: menuItem.category,
        },
        quantity: reqItem.quantity,
      });
    }

    const bulkOps = items.map((reqItem) => ({
      updateOne: {
        filter: { _id: reqItem.menuItemId },
        update: { $inc: { stock: -reqItem.quantity } },
      },
    }));
    await MenuItem.bulkWrite(bulkOps, { session });

    const { subtotal, tax, total } = calculateBill(cartItems);

    const order = await Order.create(
      [
        {
          order_id: generateOrderId(),
          items: cartItems,
          subtotal,
          tax,
          total,
          status: "Placed",
          timestamp: new Date(),
          customerNote: customerNote || "",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Emit new order event to all connected clients
    const io = req.app.get("io");
    io.emit("order:new", order[0]);

    res.status(201).json({ success: true, data: order[0] });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// GET /api/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      filter.status = { $in: statuses };
    }

    const orders = await Order.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/active
const getActiveOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: { $ne: "Completed" },
    }).sort({ timestamp: 1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id)
      ? { _id: req.params.id }
      : { order_id: req.params.id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const VALID_TRANSITIONS = {
      Placed: ["Preparing"],
      Preparing: ["Ready"],
      Ready: ["Completed"],
      Completed: [],
    };

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "status field is required" });
    }

    const query = mongoose.isValidObjectId(req.params.id)
      ? { _id: req.params.id }
      : { order_id: req.params.id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${order.status}" to "${status}". Allowed: ${allowed.join(", ") || "none"}`,
      });
    }

    order.status = status;
    await order.save();

    // Emit status update event to all connected clients
    const io = req.app.get("io");
    io.emit("order:status_updated", { order_id: order.order_id, status: order.status });

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getAllOrders, getActiveOrders, getOrderById, updateOrderStatus };