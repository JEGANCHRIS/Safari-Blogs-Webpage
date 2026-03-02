const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true, trim: true },
    mail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.role && ret.role.role) {
      ret.role = ret.role.role;
    }
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
