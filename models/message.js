const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String },
  createdAt: { type: Date, default: Date.now },
  messageType: { type: String, default: "message" },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversations",
  },
  unread: { type: Boolean, default: true },
});

module.exports = mongoose.model("messages", messageSchema);
