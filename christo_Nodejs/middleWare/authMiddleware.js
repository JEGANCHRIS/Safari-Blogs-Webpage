const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET || "265102000";
const User = require("../model/userModel");

module.exports = async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Decode token
    const decoded = jwt.verify(token, secretKey); // { id, mail, role }

    // Fetch user and populate the role
    const user = await User.findById(decoded.id).populate("role");
    console.log(user, "usershghg");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.mail,
      name: user.Name,
    };
    // console.log("role", req.user);
    console.log("Authenticated user role:", req.user.role);
    console.log("Permissions:", req.user.role?.Permissions);

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
