const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  PermissionName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  id: { type: Number, required: true },
});

module.exports = mongoose.model("permission", PermissionSchema);
