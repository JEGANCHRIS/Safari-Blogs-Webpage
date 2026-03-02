const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  MenuName: { type: String, required: true, unique: true },
  Description: { type: String, required: true },
  access: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "permission",
      required: true,
    },
  ],

  id: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model("Menu", MenuSchema);
