const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String },
  websiteUrl: { type: String },
  facebookId: { type: String },
  avatarBussiness: { type: String },
});

module.exports = mongoose.model("Sponsors", sponsorSchema);
