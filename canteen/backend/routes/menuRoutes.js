const express = require("express");
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  updateStock,
  deleteMenuItem,
} = require("../controllers/menuController");

// GET  /api/menu           — list all (supports ?category=)
// POST /api/menu           — create item
router.route("/").get(getAllMenuItems).post(createMenuItem);

// GET    /api/menu/:id     — get one
// PUT    /api/menu/:id     — full update
// DELETE /api/menu/:id     — delete
router.route("/:id").get(getMenuItemById).put(updateMenuItem).delete(deleteMenuItem);

// PATCH /api/menu/:id/stock — adjust stock by delta
router.patch("/:id/stock", updateStock);

module.exports = router;
