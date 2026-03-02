const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const secretKey = process.env.JWT_SECRET || "265102000";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, secretKey, {
    expiresIn: "7d",
  });
};

exports.login = async (req, res) => {
  try {
    const { mail, password } = req.body;
    const user = await User.findOne({ mail }).populate("role", "role");

    if (!user || !user.isActive) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        Name: user.Name,
        role: user.role.role,
        mail: user.mail,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginAsUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "user Not found" });
    }
    if (user.isSuperAdmin) {
      return res
        .status(403)
        .json({ message: "Cannot impersonate a super admin" });
    }
    const token = generateToken(user._id, user.role);
    res.json({
      message: `Now logged in as ${user.Name}`,
      token,
      user: {
        id: user._id,
        Name: user.Name,
        mail: user.mail,
        role: user.role,
      },
    });
  } catch (err) {}
};
