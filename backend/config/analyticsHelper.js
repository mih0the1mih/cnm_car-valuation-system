// backend/config/analyticsHelper.js
const Analytics = require('../models/Analytics');
const PriceHistory = require('../models/PriceHistory');
const CarListing = require('../models/CarListing');

/**
 * Cập nhật số liệu thống kê trong ngày
 * @param {string} dateString - Định dạng "YYYY-MM-DD"
 */
async function updateDailyAnalytics(dateString) {
  try {
    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

    // 1. Tính tổng số lượt định giá thành công trong ngày
    const totalValuations = await PriceHistory.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      success: true,
    });

    // 2. Tính giá định giá trung bình trong ngày
    const avgPriceResult = await PriceHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          success: true,
          estimatedPrice: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$estimatedPrice' }
        }
      }
    ]);
    const avgPrice = avgPriceResult.length > 0 ? Math.round(avgPriceResult[0].avgPrice) : 0;

    // 3. Tìm hãng xe được định giá nhiều nhất trong ngày
    const topBrandResult = await PriceHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          success: true
        }
      },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topBrand = topBrandResult.length > 0 ? topBrandResult[0]._id : 'Toyota';

    // 4. Lấy thống kê bổ sung từ CarListing (số tin đăng mới, xe đã bán, doanh thu bán được)
    const totalListings = await CarListing.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const soldCars = await CarListing.find({
      status: 'sold',
      updatedAt: { $gte: startOfDay, $lte: endOfDay }
    });
    const totalSold = soldCars.length;
    const totalRevenue = soldCars.reduce((sum, car) => sum + (car.price || 0), 0);

    // 5. Upsert vào bộ sưu tập Analytics
    await Analytics.findOneAndUpdate(
      { date: dateString },
      {
        totalValuations,
        topBrand,
        avgPrice,
        totalListings,
        totalSold,
        totalRevenue
      },
      { upsert: true, new: true }
    );
    console.log(`[Analytics] Updated analytics for ${dateString}: Valuations=${totalValuations}, Brand=${topBrand}, AvgPrice=${avgPrice}`);
  } catch (err) {
    console.error(`[Analytics Error] Failed to update analytics for ${dateString}:`, err);
  }
}

module.exports = { updateDailyAnalytics };
