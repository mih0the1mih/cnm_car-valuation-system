// backend/models/ChatLog.js
const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'bot', 'system'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      default: '',
    },
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatLog', ChatLogSchema);
