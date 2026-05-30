// backend/models/RawMarketCar.js
const mongoose = require('mongoose');

const RawMarketCarSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    priceStr: { type: String },
    mileageStr: { type: String },
    yearStr: { type: String },
    locationStr: { type: String },
    descStr: { type: String },
    source: { type: String, required: true },
    rawPayload: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed },
    isProcessed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RawMarketCar', RawMarketCarSchema);
