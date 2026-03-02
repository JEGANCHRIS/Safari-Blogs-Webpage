const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  mobile: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContactUs", contactSchema);
