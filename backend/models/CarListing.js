const mongoose = require('mongoose');
const AITrainingData = require('./AITrainingData');
const Transaction = require('./Transaction');

const CarListingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Thông tin xe
    brand: { type: String, required: true },         // Hãng xe (Toyota, Honda,...)
    model: { type: String, required: true },        // Phiên bản (Camry, Civic,...)
    version: { type: String },                      // Phiên bản chi tiết (ví dụ: 1.5 AT)
    year: { type: Number, required: true },         // Năm sản xuất
    mileage: { type: Number, required: true },      // Số km đã đi
    condition: {                                    // Tình trạng tổng thể
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    exterior: { type: String },                     // Ngoại thất (mô tả)
    interior: { type: String },                     // Nội thất
    engine: { type: String },                       // Động cơ
    // Giá
    desiredPrice:  { type: Number, required: true }, // Giá khách mong muốn
    suggestedPrice:{ type: Number },                 // Giá đề xuất từ hệ thống định giá
    price:         { type: Number },                 // Giá bán ra thực tế (sau khi nhân viên set)
    // Trạng thái hiển thị công khai
    isPublished:   { type: Boolean, default: false }, // true = hiện trên trang Mua xe
    // Hình ảnh & vị trí
    images:        [{ type: String }],               // Mảng URL ảnh
    image:         { type: String },                 // Ảnh đại diện (ảnh đầu tiên)
    location:      { type: String },                 // Tỉnh/thành phố
    // Trạng thái (Pipeline 8 bước ERP)
    status: {
      type: String,
      enum: ['pending', 'contacted', 'inspecting', 'inspected', 'pricing', 'approved', 'published', 'sold', 'rejected'],
      default: 'pending',
    },
    // Thông tin bổ sung
    notes: { type: String },
    // Kết quả từ AI (có thể lưu thêm)
    aiConfidence: { type: Number, min: 0, max: 100 },
    riskAssessment: { type: String },
  
    technical: {
      engineCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' }, // Động cơ
      transmissionCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' }, // Hộp số
      chassisCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' }, // Khung gầm
      electricalCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' }, // Hệ thống điện
      interiorCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' }, // Nội thất
      exteriorCondition: { type: String, enum: ['good', 'fair', 'poor'], default: 'good' }, // Ngoại thất
      wearAndTearPercent: { type: Number, default: 0 }, // Tỉ lệ hao mòn
      techPrice: { type: Number }, // Giá đề xuất từ kỹ thuật
      exteriorDetail: { type: String }, // Mô tả chi tiết ngoại thất (trầy xước, móp, thay mới)
      interiorDetail: { type: String }, // Mô tả chi tiết nội thất
      engineDetail: { type: String }, // Mô tả chi tiết động cơ (tiếng kêu, khói, rò rỉ)
      transmissionDetail: { type: String },
      chassisDetail: { type: String },
      electricalDetail: { type: String },
      overallRating: { type: Number, min: 1, max: 5 }, // Đánh giá tổng quan 1-5 sao
      technicianNotes: { type: String },
      inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ai kiểm tra
      inspectedAt: { type: Date },
      hasAccident: { type: Boolean, default: false },
      hasFlooded: { type: Boolean, default: false },
      damageImages: [{ type: String }],
    },
    // Nhật ký vận hành (ERP Timeline)
    history: [
      {
        time: { type: Date, default: Date.now },
        action: { type: String },
        actor: { type: String },
      }
    ],
    // Hỗ trợ trường userId trùng với customer để tạo index theo đúng yêu cầu
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

// Đồng bộ userId và customer trước khi save
CarListingSchema.pre('save', function (next) {
  if (this.customer && !this.userId) {
    this.userId = this.customer;
  } else if (this.userId && !this.customer) {
    this.customer = this.userId;
  }
  next();
});

// Thêm các index cần thiết
CarListingSchema.index({ customer: 1 });
CarListingSchema.index({ userId: 1 });

// Mongoose post-save hook to synchronize data to Transaction and AITrainingData
CarListingSchema.post('save', async function (doc) {
  try {
    const AITrainingData = mongoose.model('AITrainingData');
    const Transaction = mongoose.model('Transaction');

    // 1. Đồng bộ dữ liệu huấn luyện AI: Khi trạng thái là approved, published, hoặc sold, và đã qua bước kiểm định
    if (['approved', 'published', 'sold'].includes(doc.status)) {
      if (doc.technical && doc.technical.inspectedBy) {
        const trainPayload = {
          brand: doc.brand,
          model: doc.model,
          version: doc.version || '',
          year: doc.year,
          mileage: doc.mileage,
          km: doc.mileage, // normalized field
          condition: doc.condition || 'good', // normalized field
          location: doc.location || 'HCM', // normalized field
          marketPrice: doc.suggestedPrice || doc.desiredPrice, // normalized field
          finalSoldPrice: doc.status === 'sold' ? (doc.price || doc.desiredPrice) : undefined, // normalized field
          engineCondition: doc.technical.engineCondition || 'good',
          chassisCondition: doc.technical.chassisCondition || 'good',
          interiorCondition: doc.technical.interiorCondition || 'good',
          exteriorCondition: doc.technical.exteriorCondition || 'good',
          accidentFlood: (doc.technical.hasAccident || doc.technical.hasFlooded) ? 'Có' : 'Không',
          wearPercentage: doc.technical.wearAndTearPercent || 0,
          actualPrice: doc.price || doc.suggestedPrice || doc.desiredPrice,
          sourceListing: doc._id,
        };

        await AITrainingData.findOneAndUpdate(
          { sourceListing: doc._id },
          trainPayload,
          { upsert: true, new: true }
        );
      }
    }

    // 2. Tạo bản ghi giao dịch (Transaction): Khi xe được chuyển sang trạng thái sold
    if (doc.status === 'sold') {
      const existingTx = await Transaction.findOne({ carListing: doc._id });
      if (!existingTx) {
        await Transaction.create({
          buyer: null, // Mặc định null hoặc cập nhật sau khi hoàn tất thanh toán
          seller: doc.customer,
          carListing: doc._id,
          price: doc.price || doc.desiredPrice,
          status: 'completed',
        });
      }
    }
  } catch (err) {
    console.error('Error in CarListing post-save hook:', err);
  }
});

module.exports = mongoose.model('CarListing', CarListingSchema);