const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  dated: { type: Date, trim: true, default: Date.now },
  spoken: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
});

module.exports = mongoose.model("analytics", analyticsSchema);
