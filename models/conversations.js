const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  menteeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  status: { type: Boolean, default: true },
  ongoing: { type: Boolean, default: false },
});

module.exports = mongoose.model("conversations", conversationSchema);
