// backend/controllers/valuationController.js
// Xử lý HTTP request/response — không chứa business logic

const jwt = require('jsonwebtoken');
const { estimatePrice, getMarketStats, getPriceHistory } = require('../services/valuationService');

/**
 * POST /api/valuation/estimate
 */
const estimate = async (req, res) => {
  try {
    const { brand, model, version, year, mileage, carId, aiTrainingId } = req.body;

    if (!brand || !model || !year || mileage === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin: brand, model, year, mileage là bắt buộc.' });
    }

    // Lấy userId từ token (nếu có, không bắt buộc đăng nhập)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch (_) { /* bỏ qua lỗi token không hợp lệ */ }
    }

    const result = await estimatePrice({ brand, model, version, year, mileage, userId, carId, aiTrainingId });

    if (!result.success) {
      return res.json({
        ...result,
        message: 'Không đủ dữ liệu tham chiếu, dùng công thức ước tính.',
      });
    }

    return res.json(result);
  } catch (err) {
    console.error('[ValuationController] estimate error:', err);
    res.status(500).json({ message: 'Lỗi server khi định giá xe.', error: err.message });
  }
};

/**
 * GET /api/valuation/stats
 */
const stats = async (req, res) => {
  try {
    const data = await getMarketStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/valuation/history  (yêu cầu đăng nhập)
 */
const history = async (req, res) => {
  try {
    const data = await getPriceHistory(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { estimate, stats, history };
