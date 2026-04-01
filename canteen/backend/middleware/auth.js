const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Middleware to check if user is kitchen staff
const authorizeRole = (roles) => {
  return async (req, res, next) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(req.user.id);

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "User role not authorized to access this route",
        });
      }

      next();
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};

module.exports = { protect, authorizeRole };
