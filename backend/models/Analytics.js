// backend/models/Analytics.js
const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // Định dạng "YYYY-MM-DD"
    totalValuations: { type: Number, default: 0 },
    topBrand: { type: String, default: '' },
    avgPrice: { type: Number, default: 0 },
    totalListings: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);
