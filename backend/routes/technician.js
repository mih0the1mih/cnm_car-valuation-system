const express = require('express');
const router = express.Router();
const CarListing = require('../models/CarListing');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/technician/listings
// @desc    Lấy danh sách xe cần kiểm tra (pending hoặc priced, chưa có technical.inspectedBy)
// @access  Private (technician, admin)
router.get('/listings', protect, authorize('technician', 'admin'), async (req, res) => {
  try {
    // Lấy các xe đã có giá đề xuất (priced) hoặc chờ (pending) nhưng chưa được kiểm tra kỹ thuật
    const listings = await CarListing.find({
      status: { $in: ['pending', 'priced'] },
      'technical.inspectedBy': { $exists: false }
    }).populate('customer', 'name email').sort({ createdAt: 1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/technician/listing/:id
// @desc    Lấy chi tiết xe để kiểm tra
// @access  Private (technician, admin)
router.get('/listing/:id', protect, authorize('technician', 'admin'), async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id).populate('customer', 'name email');
    if (!listing) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/technician/listing/:id/inspect
// @desc    Cập nhật kết quả kiểm tra kỹ thuật
// @access  Private (technician, admin)
router.put('/listing/:id/inspect', protect, authorize('technician', 'admin'), async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Không tìm thấy' });

    const {
      engineCondition, transmissionCondition, chassisCondition, electricalCondition,
      exteriorDetail, interiorDetail, engineDetail, transmissionDetail, chassisDetail,
      electricalDetail, overallRating, technicianNotes
    } = req.body;

    // Cập nhật các trường technical
    listing.technical = {
      engineCondition: engineCondition || listing.technical.engineCondition,
      transmissionCondition: transmissionCondition || listing.technical.transmissionCondition,
      chassisCondition: chassisCondition || listing.technical.chassisCondition,
      electricalCondition: electricalCondition || listing.technical.electricalCondition,
      exteriorDetail,
      interiorDetail,
      engineDetail,
      transmissionDetail,
      chassisDetail,
      electricalDetail,
      overallRating,
      technicianNotes,
      inspectedBy: req.user.id,
      inspectedAt: new Date()
    };

    // Nếu trước đó chưa có giá đề xuất, có thể chuyển trạng thái sang 'inspecting'
    if (listing.status === 'pending') listing.status = 'inspecting';

    await listing.save();
    res.json({ message: 'Đã cập nhật kết quả kiểm tra', listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;