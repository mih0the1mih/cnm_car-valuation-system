// backend/services/valuationService.js
// Business logic cho hệ thống định giá xe

const MarketCar = require('../models/MarketCar');
const PriceHistory = require('../models/PriceHistory');
const CarPriceList = require('../models/CarPriceList');
const { classifyVersion } = require('../utils/carHelpers');
const { updateDailyAnalytics } = require('../config/analyticsHelper');
const { calculateDynamicPrice } = require('../ai/pricing/pricingCalculator');

/**
 * Ước tính giá xe dựa trên dữ liệu thị trường (Dynamic Pricing Engine)
 * @param {object} params - { brand, model, version, year, mileage, userId, carId, aiTrainingId, priceNew, marketDemand, batteryHealth, rarityFactor, terrainFactor }
 * @returns {object} - { success, estimatedPrice, priceRange, sampleCount, ... }
 */
async function estimatePrice({ brand, model, version, year, mileage, userId, carId, aiTrainingId, priceNew, marketDemand, batteryHealth, rarityFactor, terrainFactor }) {
  const yearInt    = parseInt(year);
  const mileageInt = parseInt(mileage);
  const reqVersionClass = classifyVersion(version);

  // 1. Query xe tương tự: cùng hãng, cùng model, năm ±1
  let similarCars = await MarketCar.find({
    brand: { $regex: new RegExp(`^${brand}$`, 'i') },
    model: { $regex: new RegExp(`^${model}$`, 'i') },
    year:  { $gte: yearInt - 1, $lte: yearInt + 1 },
  }).select('price mileage year versionClass');

  let sampleCount = similarCars.length;

  // 2. Ưu tiên xe cùng versionClass nếu đủ mẫu
  const exactClassCars = similarCars.filter(c => c.versionClass === reqVersionClass);
  let usedFallbackFactor = false;

  if (exactClassCars.length >= 2) {
    similarCars = exactClassCars;
    sampleCount = similarCars.length;
  } else if (sampleCount >= 2 && reqVersionClass !== 'other') {
    usedFallbackFactor = true;
  }

  const baseHistory = {
    user: userId || null,
    carId: carId || null,
    aiTrainingId: aiTrainingId || null,
    brand,
    model,
    version: version || '',
    year: yearInt,
    mileage: mileageInt,
  };

  // 3. Xác định priceNew theo thứ tự ưu tiên:
  //    (1) Tra cứu từ CarPriceList (Master Data) — chính xác nhất
  //    (2) Fallback: lấy giá cao nhất trên thị trường + 10%
  let activePriceNew = priceNew;
  let priceNewSource = 'user_input';

  if (!activePriceNew) {
    // (1) Tra cứu Master Data — ưu tiên tìm chính xác version
    let masterRecord = null;
    if (version) {
      masterRecord = await CarPriceList.findOne({
        brand: { $regex: new RegExp(`^${brand}$`, 'i') },
        model: { $regex: new RegExp(`^${model}$`, 'i') },
        version: { $regex: new RegExp(`^${version}$`, 'i') },
      });
    }

    // Nếu không tìm thấy chính xác version, lấy trung bình tất cả version cùng model
    if (!masterRecord) {
      const allVersions = await CarPriceList.find({
        brand: { $regex: new RegExp(`^${brand}$`, 'i') },
        model: { $regex: new RegExp(`^${model}$`, 'i') },
      });
      if (allVersions.length > 0) {
        activePriceNew = Math.round(allVersions.reduce((sum, v) => sum + v.priceNew, 0) / allVersions.length);
        priceNewSource = 'master_data_avg';
      }
    } else {
      activePriceNew = masterRecord.priceNew;
      priceNewSource = 'master_data_exact';
    }

    // (2) Fallback: thị trường
    if (!activePriceNew) {
      const highestPricedCar = await MarketCar.findOne({
        brand: { $regex: new RegExp(`^${brand}$`, 'i') },
        model: { $regex: new RegExp(`^${model}$`, 'i') }
      }).sort({ price: -1 }).select('price');

      if (highestPricedCar) {
        activePriceNew = highestPricedCar.price * 1.1;
        priceNewSource = 'market_fallback';
      } else {
        await PriceHistory.create({ ...baseHistory, estimatedPrice: null, success: false });
        return { success: false, sampleCount, estimatedPrice: null, message: "Không tìm thấy dữ liệu giá niêm yết và dữ liệu thị trường cho dòng xe này." };
      }
    }
  }

  // 4. Áp dụng Dynamic Pricing Engine
  const pricingResult = calculateDynamicPrice({
    brand,
    priceNew: activePriceNew,
    year: yearInt,
    mileage: mileageInt,
    marketDemand,
    batteryHealth,
    rarityFactor,
    terrainFactor
  });
  
  let estimatedPrice = pricingResult.finalPrice;

  // 5. Khoảng giá thị trường (nếu có xe tương tự)
  let priceMin = 0, priceMax = 0;
  if (similarCars.length > 0) {
    const prices   = similarCars.map(c => c.price).sort((a, b) => a - b);
    priceMin = prices[0];
    priceMax = prices[prices.length - 1];
  } else {
    // Nếu không có xe tương tự trên thị trường, tạo khoảng giá ước tính 5%
    priceMin = Math.round(estimatedPrice * 0.95);
    priceMax = Math.round(estimatedPrice * 1.05);
  }

  // 8. Lưu lịch sử định giá
  await PriceHistory.create({
    ...baseHistory,
    marketCarIds: similarCars.map(c => c._id),
    estimatedPrice: Math.round(estimatedPrice),
    priceMin,
    priceMax,
    success: true,
  });

  // 9. Cập nhật analytics bất đồng bộ (không block response)
  const todayStr = new Date().toISOString().split('T')[0];
  updateDailyAnalytics(todayStr).catch(err =>
    console.error('[ValuationService] Analytics update failed:', err)
  );

  return {
    success: true,
    estimatedPrice: Math.round(estimatedPrice),
    sampleCount,
    priceRange: { min: priceMin, max: priceMax },
    debug: { ...pricingResult.details, priceNewSource },
  };
}

/**
 * Lấy thống kê dữ liệu thị trường từ MarketCar collection
 */
async function getMarketStats() {
  const total        = await MarketCar.countDocuments();
  const bonbanhCount = await MarketCar.countDocuments({ source: 'bonbanh' });
  const chototCount  = await MarketCar.countDocuments({ source: 'chotot' });
  const brands       = await MarketCar.distinct('brand');
  const newest       = await MarketCar.findOne().sort({ createdAt: -1 }).select('brand model year createdAt');
  return { total, bonbanhCount, chototCount, brandCount: brands.length, brands, newest };
}

/**
 * Lấy lịch sử định giá của một user
 */
async function getPriceHistory(userId) {
  return PriceHistory.find({ user: userId }).sort({ createdAt: -1 });
}

module.exports = { estimatePrice, getMarketStats, getPriceHistory };
