// backend/models/CarPriceList.js
// Bảng giá niêm yết trung tâm (Master Data) - Giá lăn bánh mới của từng dòng xe

const mongoose = require('mongoose');

const CarPriceListSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      index: true,
    },
    version: {
      type: String,
      default: '',
    },
    // Giá niêm yết (VNĐ) - giá lăn bánh trung bình lúc mua mới
    priceNew: {
      type: Number,
      required: true,
    },
    // Năm áp dụng giá (năm ra mắt hoặc năm cập nhật giá gần nhất)
    yearApplicable: {
      type: Number,
      default: new Date().getFullYear(),
    },
    // Nguồn dữ liệu
    source: {
      type: String,
      enum: ['official', 'market_estimate', 'manual'],
      default: 'manual',
    },
    // Ghi chú
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index để tra cứu nhanh
CarPriceListSchema.index({ brand: 1, model: 1, version: 1 });

module.exports = mongoose.model('CarPriceList', CarPriceListSchema);
