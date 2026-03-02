const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const Role = require("../model/RoleModels");
const Permission = require("../model/permissionSchema");
const categoryModel = require("../model/category");
const mongoose = require("mongoose");
const category = require("../model/category");

/**
 * SuperAdmin bootstrap – no auth guard here on purpose for first run.
 * In production, protect this or seed via scripts.
 */



exports.createSuperAdmin = async (req, res) => {
  try {
    const { Name, mail, password } = req.body;
    const exists = await User.findOne({ mail });
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      Name,
      mail,
      password: hash,
      role: "superAdmin",
    });
    res.status(201).json({
      message: "SuperAdmin created",
      user: { id: user._id, mail, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Admin creation (superAdmin only) */
exports.createAdmin = async (req, res) => {
  try {
    const { Name, mail, password } = req.body;

    // Check if email already exists
    const exists = await User.findOne({ mail: mail.trim().toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Find admin role (must exist in Role collection)
    const roleDoc = await Role.findOne({ role: "Admin" });
    if (!roleDoc) {
      return res.status(400).json({ message: "Admin role not found" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new admin
    const user = await User.create({
      Name,
      mail: mail.trim().toLowerCase(),
      password: hash,
      role: roleDoc._id,
    });

    res.status(201).json({
      message: "Admin created",
      user: { id: user._id, mail: user.mail, role: roleDoc.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Standard user creation (admin or superAdmin) */
exports.createUser = async (req, res) => {
  try {
    const { Name, mail, password, role } = req.body;

    // check if user exists
    const exists = await User.findOne({ mail });
    console.log("Incoming email:", `"${mail}"`);
    console.log("Normalized email:", `"${mail.trim().toLowerCase()}"`);

    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (!mongoose.Types.ObjectId.isValid(role)) {
      console.log("Invalid ObjectId format:", role);
      return res.status(400).json({ message: "Invalid role format" });
    }

    // find roleDoc by role
    // const roleDoc = await Role.findOne({ role: "User" });
    console.log("Received role ID:", role);
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // create user with role name instead of ObjectId
    const user = await User.create({
      Name,
      mail,
      password: hash,
      role: roleDoc._id,
    });

    res.status(201).json({
      message: "User created",
      user: { id: user._id, mail: user.mail, role: roleDoc.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/** Update any user (admin & superAdmin) */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    // Only allow limited fields from request to avoid role tampering by admin (unless superAdmin)
    const allowed = ["Name", "mail", "password", "isActive"];
    if (req.user.role !== "superAdmin") {
      // admin cannot change role
      allowed.push(); // no role change
      delete payload.role;
    }
    const toSet = {};
    for (const k of allowed)
      if (payload[k] !== undefined) toSet[k] = payload[k];

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { ...toSet, isActive: false } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User updated",
      user: { id: updated._id, mail: updated.mail, role: updated.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Delete user/admin (superAdmin only) */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted", id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { role, roleId, isSuperAdmin, Permissions } = req.body;

    // Validate required fields
    if (!role || !roleId) {
      return res.status(400).json({ message: "role and roleId are required" });
    }

    // Validate permissions exist
    let permissionIds = [];
    if (Permissions?.length) {
      const found = await Permission.find({ _id: { $in: Permissions } });
      permissionIds = found.map((p) => p._id);
    }

    // Create role
    const newRole = new Role({
      role,
      roleId,
      isSuperAdmin: isSuperAdmin || false,
      Permissions: permissionIds,
    });

    await newRole.save();

    res.status(201).json({
      message: "Role created successfully",
      role: newRole,
    });
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("Permissions");
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, Description } = req.body;
    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const existsing = await categoryModel.findOne({ categoryName });
    if (existsing) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const categoryCreation = await categoryModel.create({
      categoryName,
      Description,
    });
    res.status(200).json({ message: "category Created", categoryCreation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const categories = await category.find();
    res.status(200).json({ categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const users = await User.find({}, { password: 0 }) // exclude password
      .populate("role", "role Permissions roleId isSuperAdmin") // bring both role + permissions
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    const formattedUsers = {};
    users.forEach((u) => {
      const userObj = {
        ...u.toObject(),
        role: u.role?.role || null,
        permissions: u.role?.Permissions || [],
        roleID: u.role?.roleId || null,
        isSuperAdmin: u.role?.isSuperAdmin || false,
      };

      const roleName = userObj.role;

      if (!formattedUsers[roleName]) {
        formattedUsers[roleName] = [userObj]; // always start with array
      } else {
        formattedUsers[roleName].push(userObj);
      }
    });

    res.status(201).json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      Datas: formattedUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
