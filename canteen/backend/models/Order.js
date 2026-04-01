const mongoose = require("mongoose");

const ORDER_STATUSES = ["Placed", "Preparing", "Ready", "Completed"];

const cartItemSchema = new mongoose.Schema(
  {
    menuItem: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: String,
      image_url: String,
      stock: Number,
      category: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Placed",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Optional: customer name or token for future auth
    customerNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for kitchen dashboard queries
orderSchema.index({ status: 1, timestamp: -1 });

orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);
