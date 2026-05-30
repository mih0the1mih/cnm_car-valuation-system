// backend/routes/valuation.js
// Route-only: chỉ định nghĩa endpoints, logic ở controller/service

const express  = require('express');
const router   = express.Router();
const { protect } = require('../middlewares/auth');
const { estimate, stats, history } = require('../controllers/valuationController');

// POST /api/valuation/estimate  — Định giá xe (không cần đăng nhập)
router.post('/estimate', estimate);

// GET  /api/valuation/stats     — Thống kê dữ liệu thị trường
router.get('/stats', stats);

// GET  /api/valuation/history   — Lịch sử định giá (cần đăng nhập)
router.get('/history', protect, history);

module.exports = router;
