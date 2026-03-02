const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  isSuperAdmin: { type: Boolean, default: false },
  roleId: { type: Number, required: true, unique: true },
  Permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "permission",
      required: true,
    },
  ],
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Role", RoleSchema);
