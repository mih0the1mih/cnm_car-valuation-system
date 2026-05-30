// backend/models/AITrainingData.js
const mongoose = require('mongoose');

const AITrainingDataSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    version: { type: String },
    year: { type: Number, required: true },
    mileage: { type: Number, required: true },
    km: { type: Number, required: true }, // Số km đã đi (chuẩn hóa)
    condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' }, // Tình trạng tổng thể
    location: { type: String }, // Tỉnh/thành phố (ví dụ: HCM, Hà Nội)
    marketPrice: { type: Number }, // Giá tham chiếu thị trường (estimatedPrice)
    finalSoldPrice: { type: Number }, // Giá bán ra thực tế (price)
    
    // Thuộc tính kỹ thuật làm đầu vào cho AI
    engineCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
    chassisCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
    interiorCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
    exteriorCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' },
    accidentFlood: { type: String, enum: ['Có', 'Không'], default: 'Không' },
    wearPercentage: { type: Number, default: 0 },
    
    // Kết quả đầu ra (giá trị thực tế để huấn luyện - tương thích cũ)
    actualPrice: { type: Number, required: true },
    
    // Trạng thái huấn luyện
    isTrained: { type: Boolean, default: false, index: true },
    sourceListing: { type: mongoose.Schema.Types.ObjectId, ref: 'CarListing' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AITrainingData', AITrainingDataSchema);
