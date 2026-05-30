// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role, ... }
      next();
    } catch (err) {
      res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Không có quyền truy cập, thiếu token' });
  }
};

// Kiểm tra quyền (role)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
  };
};

module.exports = { protect, authorize };