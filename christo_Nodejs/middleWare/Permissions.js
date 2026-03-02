// Permission map per role
const Role = require("../model/RoleModels");
const PERMISSIONS = {
  user: [
    "blog:create", // can create own blog
    "blog:update:own", // (optional) allow updating own blogs
  ],
  admin: [
    "blog:create",
    "blog:update:any", // can update any blog
    "user:update", // can update user (not delete)
  ],
  superAdmin: [
    "blog:create",
    "blog:update:any",
    "user:update",
    "user:delete", // can delete user
    "admin:create",
    "admin:update",
    "admin:delete",
  ],
};

// Check permission
function allow(permission) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Unauthenticated" });

    const allowed = PERMISSIONS[role] || [];
    if (!allowed.includes(permission)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// Simple role guard (when you want coarse control)

function roleIn(roles = []) {
  return (req, res, next) => {
    const roleName = req.user?.role?.role; // extract the role string
    console.log("roleName =", roleName);

    if (!roleName || !roles.includes(roleName)) {
      return res.status(403).json({ message: "Access denied-1" });
    }
    next();
  };
}

module.exports = { allow, roleIn, PERMISSIONS };
