// backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const { protect } = require('../middlewares/auth');
const { updateDailyAnalytics } = require('../config/analyticsHelper');

// @route   GET /api/analytics/dashboard
// @desc    Lấy dữ liệu thống kê tổng hợp cho Dashboard
// @access  Public (hoặc Private tùy cấu hình, ở đây mở rộng để hiển thị)
router.get('/dashboard', async (req, res) => {
  try {
    // Tự động trigger cập nhật ngày hôm nay trước khi lấy dữ liệu để đảm bảo real-time
    const todayStr = new Date().toISOString().split('T')[0];
    await updateDailyAnalytics(todayStr);

    // Lấy 30 bản ghi gần nhất để hiển thị biểu đồ xu hướng
    const history = await Analytics.find()
      .sort({ date: -1 })
      .limit(30);

    // Tính tổng lũy kế các chỉ số quan trọng
    const summary = await Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalValuations: { $sum: '$totalValuations' },
          totalListings: { $sum: '$totalListings' },
          totalSold: { $sum: '$totalSold' },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      }
    ]);

    const statsSummary = summary.length > 0 ? summary[0] : {
      totalValuations: 0,
      totalListings: 0,
      totalSold: 0,
      totalRevenue: 0
    };

    // Tìm hãng xe được định giá nhiều nhất tổng thể
    const topBrandResult = await Analytics.aggregate([
      {
        $group: {
          _id: '$topBrand',
          count: { $sum: '$totalValuations' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const overallTopBrand = topBrandResult.length > 0 ? topBrandResult[0]._id : 'Toyota';

    res.json({
      success: true,
      summary: {
        ...statsSummary,
        overallTopBrand
      },
      trend: history.reverse() // Trả về theo thứ tự thời gian tăng dần để vẽ biểu đồ
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi tải dữ liệu thống kê.', error: err.message });
  }
});

// @route   POST /api/analytics/trigger
// @desc    Trigger cập nhật thủ công dữ liệu thống kê của một ngày cụ thể
// @access  Private (Chỉ quản lý/admin)
router.post('/trigger', async (req, res) => {
  try {
    const { date } = req.body; // format YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ngày dạng YYYY-MM-DD' });
    }
    await updateDailyAnalytics(date);
    res.json({ message: `Cập nhật thống kê cho ngày ${date} thành công.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
