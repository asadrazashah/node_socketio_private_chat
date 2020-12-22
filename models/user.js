const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  fullName: { type: String, minlength: 3, required: true },
  city: { type: String },
  country: { type: String },
  password: { type: String, minlength: 8, required: true },
  aboutMe: { type: String, required: false },
  dateOfBirth: { type: Date, required: false, trim: true },
  userType: { type: String },
  userMentor: { type: mongoose.Schema.Types.ObjectId },
  userMentees: [{ type: mongoose.Schema.Types.ObjectId }],
  settings: {
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    notificationSound: { type: Boolean, default: true },
  },
  interests: { type: String },
  userAvatar: { type: String },
  online: { type: Boolean, default: false },
  firstName: { type: String },
  bio: { type: String },
  address: { type: String },
  lastLoggedIn: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("User", userSchema);
