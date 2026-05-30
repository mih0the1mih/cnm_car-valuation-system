// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Chỉ admin mới có quyền xem danh sách user (ví dụ)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Thay đổi thông tin cá nhân và role của user
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;

    await user.save();
    
    // Xóa password khỏi kết quả trả về
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa user
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin tạo user mới trực tiếp
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' });
    }

    // Kiểm tra email và số điện thoại tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
    });

    const createdUser = user.toObject();
    delete createdUser.password;

    res.status(201).json(createdUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;