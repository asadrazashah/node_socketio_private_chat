const mongoose = require("mongoose");

const changeMentorFeedback = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  menteeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: { type: String },
});

module.exports = mongoose.model("changeMentorFeedback", changeMentorFeedback);
