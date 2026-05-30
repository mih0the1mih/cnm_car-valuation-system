// backend/models/PriceHistory.js
const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Có thể định giá không cần đăng nhập (khách vãng lai)
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarListing',
      required: false,
    },
    marketCarIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketCar',
      }
    ],
    aiTrainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AITrainingData',
      required: false,
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    version: { type: String, default: '' },
    year: { type: Number, required: true },
    mileage: { type: Number, required: true },
    estimatedPrice: { type: Number },
    priceMin: { type: Number },
    priceMax: { type: Number },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes để tối ưu hóa truy vấn
PriceHistorySchema.index({ user: 1 });
PriceHistorySchema.index({ carId: 1 });
PriceHistorySchema.index({ aiTrainingId: 1 });

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
