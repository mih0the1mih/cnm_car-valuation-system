const express = require('express');
const router = express.Router();
const CarListing = require('../models/CarListing');
const { protect } = require('../middlewares/auth');

// @route   POST /api/car-listings
// @desc    Tạo yêu cầu bán xe mới (khách hàng)
// @access  Private (customer hoặc bất kỳ role nào, nhưng ta sẽ kiểm tra)
router.post('/', protect, async (req, res) => {
  try {
    const isStaff = ['admin', 'purchasing_staff', 'manager', 'technician'].includes(req.user.role);
    
    const listingData = {
      ...req.body,
      customer: req.body.customer || req.user.id,
    };

    // Nếu không phải staff thì ép status về pending cho an toàn
    if (!isStaff) {
      listingData.status = 'pending';
    }

    const listing = await CarListing.create(listingData);

    res.status(201).json(listing);
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/car-listings/published
// @desc    Lấy danh sách xe đang bán (public - không cần đăng nhập)
// @access  Public
router.get('/published', async (req, res) => {
  try {
    const { brand, location, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const filter = { $or: [{ isPublished: true }, { status: 'published' }] };
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cars, total] = await Promise.all([
      CarListing.find(filter)
        .select('brand model year mileage price condition images image location notes createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CarListing.countDocuments(filter),
    ]);

    res.json({ cars, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/car-listings
// @desc    Lấy tất cả yêu cầu bán xe (chỉ staff/admin)
// @access  Private (staff, manager, admin)
router.get('/', protect, async (req, res) => {
  try {
    const allowedRoles = ['admin', 'purchasing_staff', 'manager', 'technician'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền xem danh sách này' });
    }
    const listings = await CarListing.find()
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/car-listings/my-listings
// @desc    Lấy danh sách xe đã đăng của khách hàng hiện tại
// @access  Private
router.get('/my-listings', protect, async (req, res) => {
  try {
    const listings = await CarListing.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// @route   GET /api/car-listings/public/:id
// @desc    Lấy chi tiết xe (public - không cần đăng nhập)
// @access  Public
router.get('/public/:id', async (req, res) => {
  try {
    const car = await CarListing.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Không tìm thấy xe' });

    // Chỉ cho phép xem nếu xe đã được đăng bán công khai
    if (car.status !== 'published' && !car.isPublished) {
      return res.status(403).json({ message: 'Bạn không có quyền xem xe này' });
    }

    res.json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/car-listings/:id
// @desc    Lấy chi tiết một yêu cầu (chỉ chủ sở hữu hoặc admin/nhân viên)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id).populate('customer', 'name email phone');
    if (!listing) return res.status(404).json({ message: 'Không tìm thấy' });

    // Cho phép nếu là chủ sở hữu, hoặc admin, hoặc nhân viên thu mua, hoặc quản lý, hoặc kỹ thuật viên
    const allowedRoles = ['admin', 'purchasing_staff', 'manager', 'technician'];
    if (
      listing.customer._id.toString() !== req.user.id &&
      !allowedRoles.includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Không có quyền xem' });
    }

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/car-listings/:id
// @desc    Cập nhật yêu cầu (khách hàng có thể cập nhật trước khi được định giá)
// @access  Private (chủ sở hữu)
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Không tìm thấy' });

    const allowedRoles = ['admin', 'purchasing_staff', 'manager', 'technician'];
    const isStaff = allowedRoles.includes(req.user.role);

    if (!isStaff && listing.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền sửa' });
    }

    if (!isStaff && listing.status !== 'pending') {
      return res.status(400).json({ message: 'Không thể sửa yêu cầu đã được xử lý' });
    }

    if (isStaff) {
      // Ghi lại nhật ký nếu có actionLabel
      if (req.body.actionLabel) {
        listing.history.push({
          action: req.body.actionLabel,
          actor: req.user.name || req.user.role,
          time: new Date()
        });
        delete req.body.actionLabel;
      }

      // Nhận mọi update từ nhân viên bằng listing.set
      listing.set(req.body);
    } else {
      const allowedUpdates = ['brand', 'model', 'version', 'year', 'mileage', 'condition', 'exterior', 'interior', 'engine', 'desiredPrice', 'notes'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) listing[field] = req.body[field];
      });
    }

    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/car-listings/:id
// @desc    Xóa yêu cầu (chỉ khi còn pending)
// @access  Private (chủ sở hữu)
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Không tìm thấy' });

    const isAdmin = ['admin', 'manager'].includes(req.user.role);

    if (!isAdmin && listing.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xóa' });
    }

    if (!isAdmin && listing.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể xóa yêu cầu ở trạng thái chờ' });
    }

    await listing.deleteOne();
    res.json({ message: 'Đã xóa yêu cầu thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;