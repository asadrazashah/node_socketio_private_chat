const mongoose = require("mongoose");

const thumbsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: { type: String },
  thumbValue: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversations",
  },
});

module.exports = mongoose.model("thumbs", thumbsSchema);
