const mongoose = require("mongoose");

const announcmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("announcments", announcmentSchema);
