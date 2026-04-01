const MenuItem = require("../models/MenuItem");

// GET /api/menu
// Returns all available menu items
const getAllMenuItems = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/menu/:id
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// POST /api/menu
// Create a new menu item (admin)
const createMenuItem = async (req, res, next) => {
  try {
    const { name, price, description, image_url, stock, category } = req.body;
    const item = await MenuItem.create({ name, price, description, image_url, stock, category });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/menu/:id
// Update menu item (admin — can update any field)
const updateMenuItem = async (req, res, next) => {
  try {
    const allowedFields = ["name", "price", "description", "image_url", "stock", "category", "isAvailable"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/menu/:id/stock
// Adjust stock only (used internally after checkout; can also be called directly)
const updateStock = async (req, res, next) => {
  try {
    const { delta } = req.body; // positive = restock, negative = consume
    if (typeof delta !== "number") {
      return res.status(400).json({ success: false, message: "delta (number) is required" });
    }

    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const newStock = item.stock + delta;
    if (newStock < 0) {
      return res.status(409).json({ success: false, message: "Insufficient stock" });
    }

    item.stock = newStock;
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    res.json({ success: true, message: "Menu item deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, updateStock, deleteMenuItem };
