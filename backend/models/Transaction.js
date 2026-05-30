// backend/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Có thể mua trực tiếp từ hệ thống (Showroom) hoặc khách mua của khách
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    carListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarListing',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'installment'],
      default: 'bank_transfer',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Thêm index cho Transaction để query nhanh hơn theo thời gian
TransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
