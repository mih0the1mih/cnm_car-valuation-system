// backend/routes/carPriceList.js
// API endpoint để tra cứu giá niêm yết xe mới (Master Data)

const express = require('express');
const router = express.Router();
const CarPriceList = require('../models/CarPriceList');

// GET /api/price-list?brand=Toyota&model=Vios&version=1.5G CVT
// Tra cứu giá niêm yết theo brand, model, version
router.get('/', async (req, res) => {
  try {
    const { brand, model, version } = req.query;
    const filter = {};

    if (brand) filter.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    if (model) filter.model = { $regex: new RegExp(`^${model}$`, 'i') };
    if (version) filter.version = { $regex: new RegExp(version, 'i') };

    const results = await CarPriceList.find(filter)
      .select('brand model version priceNew yearApplicable')
      .sort({ brand: 1, model: 1, version: 1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/price-list/lookup
// Tra cứu chính xác 1 dòng xe → trả về priceNew
// Query: ?brand=Toyota&model=Vios&version=1.5G CVT
router.get('/lookup', async (req, res) => {
  try {
    const { brand, model, version } = req.query;

    if (!brand || !model) {
      return res.status(400).json({ message: 'Cần ít nhất brand và model' });
    }

    // Ưu tiên tìm chính xác brand + model + version
    let record = null;
    if (version) {
      record = await CarPriceList.findOne({
        brand: { $regex: new RegExp(`^${brand}$`, 'i') },
        model: { $regex: new RegExp(`^${model}$`, 'i') },
        version: { $regex: new RegExp(`^${version}$`, 'i') },
      });
    }

    // Nếu không tìm thấy chính xác version, lấy giá trung bình của tất cả version cùng model
    if (!record) {
      const allVersions = await CarPriceList.find({
        brand: { $regex: new RegExp(`^${brand}$`, 'i') },
        model: { $regex: new RegExp(`^${model}$`, 'i') },
      });

      if (allVersions.length === 0) {
        return res.json({ found: false, priceNew: null, message: 'Không tìm thấy dữ liệu giá niêm yết cho dòng xe này' });
      }

      const avgPrice = Math.round(allVersions.reduce((sum, v) => sum + v.priceNew, 0) / allVersions.length);
      return res.json({
        found: true,
        exact: false,
        priceNew: avgPrice,
        versionsAvailable: allVersions.map(v => ({ version: v.version, priceNew: v.priceNew })),
        message: `Không tìm thấy version chính xác. Giá trung bình của ${allVersions.length} phiên bản: ${avgPrice.toLocaleString()} VNĐ`
      });
    }

    return res.json({
      found: true,
      exact: true,
      priceNew: record.priceNew,
      brand: record.brand,
      model: record.model,
      version: record.version,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/price-list/brands
// Lấy danh sách tất cả brand có trong bảng giá
router.get('/brands', async (req, res) => {
  try {
    const brands = await CarPriceList.distinct('brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
