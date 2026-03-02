const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: Schema.Types.Mixed, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    bannerImage: { type: String, required: true },
    cardImage: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
