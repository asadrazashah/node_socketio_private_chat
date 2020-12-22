const mongoose = require("mongoose");

const learnMore = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
});

module.exports = mongoose.model("learnMore", learnMore);
