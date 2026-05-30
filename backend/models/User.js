// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Địa chỉ email không hợp lệ'],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, 'Số điện thoại phải bao gồm đúng 10 chữ số'],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'purchasing_staff', 'manager', 'technician', 'customer'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);