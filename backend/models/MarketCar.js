// backend/models/MarketCar.js
// Model lưu dữ liệu tham chiếu thị trường để định giá xe
const mongoose = require('mongoose');

const MarketCarSchema = new mongoose.Schema(
  {
    brand:   { type: String, required: true, index: true },  // Hãng xe
    model:   { type: String, required: true, index: true },  // Dòng xe
    version: { type: String, default: '' },                  // Phiên bản (ví dụ: 2.5Q)
    versionClass: { type: String, enum: ['premium', 'standard', 'other'], default: 'other' }, // Phân loại phiên bản
    year:    { type: Number, required: true, index: true },  // Năm sản xuất
    mileage: { type: Number, required: true },               // Số km đã đi
    price:   { type: Number, required: true },               // Giá bán thực tế (VND)
    fuel:    { type: String, enum: ['gasoline', 'diesel', 'electric', 'hybrid'], default: 'gasoline' },
    transmission: { type: String, enum: ['AT', 'MT', 'CVT'], default: 'AT' },
    source:  { type: String, default: 'manual' },            // 'manual' | 'crawled'
    location:{ type: String },                               // Tỉnh/thành
    rawMarketCarId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMarketCar', required: false },
  },
  { timestamps: true }
);

// Indexes để tăng tốc query định giá
MarketCarSchema.index({ brand: 1, model: 1, year: 1 });
MarketCarSchema.index({ brand: 1, model: 1, year: 1, versionClass: 1 });

module.exports = mongoose.model('MarketCar', MarketCarSchema);
