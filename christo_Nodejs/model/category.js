const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  Description: { type: String },
});

module.exports = mongoose.model("Category", CategorySchema);
