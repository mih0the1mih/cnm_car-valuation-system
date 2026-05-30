// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const ChatLog = require('../models/ChatLog');
const jwt = require('jsonwebtoken');

/**
 * POST /api/chat/message
 * Body: { message, sessionId }
 * Nhận tin nhắn từ người dùng, lưu vào ChatLog, trả về phản hồi mô phỏng của AI.
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ message: 'Thiếu message hoặc sessionId' });
    }

    // Xác thực tùy chọn nếu có token
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch (err) {}
    }

    // 1. Lưu tin nhắn của người dùng
    const userMsg = await ChatLog.create({
      user: userId,
      sessionId,
      sender: 'user',
      message: message.trim()
    });

    // 2. Xử lý phản hồi tự động dựa trên từ khóa (Mock AI Rule-based)
    let botReply = '';
    let intent = 'general';
    const msgLower = message.toLowerCase();

    if (msgLower.includes('định giá') || msgLower.includes('giá xe') || msgLower.includes('trị giá')) {
      botReply = 'Chào bạn! Để định giá xe chính xác, bạn có thể click vào nút "Định giá xe" trên trang chủ hoặc chọn một logo hãng xe để điền thông tin chi tiết (Đời xe, ODO, phiên bản). AI của tôi sẽ tính toán ngay!';
      intent = 'valuation';
    } else if (msgLower.includes('bán xe') || msgLower.includes('ký gửi')) {
      botReply = 'Chúng tôi có quy trình thu mua 8 bước chuyên nghiệp. Bạn có thể đăng yêu cầu bán xe trực tiếp, kỹ thuật viên sẽ đến tận nơi kiểm tra và chúng tôi sẽ chốt giá trong 24h!';
      intent = 'sell_car';
    } else if (msgLower.includes('mua xe') || msgLower.includes('tìm xe')) {
      botReply = 'Bạn muốn mua xe gì? Hiện tại showroom đang có nhiều dòng xe lướt chất lượng như Toyota Vios, Camry, Honda CR-V được kiểm định 160 điểm. Bạn vào mục "Mua xe" để xem nhé!';
      intent = 'buy_car';
    } else {
      botReply = 'Xin chào! Tôi là Trợ lý ảo của Store Car. Tôi có thể hỗ trợ bạn định giá xe, thủ tục mua bán, ký gửi xe cũ hoặc kết nối trực tiếp với nhân viên thu mua. Hãy cho tôi biết nhu cầu của bạn nhé!';
      intent = 'general';
    }

    // Cập nhật lại intent cho tin nhắn của user
    userMsg.intent = intent;
    await userMsg.save();

    // 3. Lưu tin nhắn của Bot
    const botMsg = await ChatLog.create({
      user: userId,
      sessionId,
      sender: 'bot',
      message: botReply,
      intent
    });

    return res.json({
      userMessage: userMsg,
      botReply: botMsg
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi chat.' });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Lấy toàn bộ lịch sử trò chuyện của một phiên
 */
router.get('/history/:sessionId', async (req, res) => {
  try {
    const logs = await ChatLog.find({ sessionId: req.params.sessionId }).sort({ createdAt: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
