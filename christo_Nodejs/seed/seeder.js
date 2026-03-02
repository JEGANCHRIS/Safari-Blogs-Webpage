const bcrypt = require("bcrypt");
const Permission = require("../model/permissionSchema");
const Role = require("../model/RoleModels");
const User = require("../model/userModel");

const seedSuperAdmin = async () => {
  try {
    // fetch all permissions
    const permissions = await Permission.find();
    const permissionIds = permissions.map((p) => p._id);

    // check role
    let role = await Role.findOne({ role: "superAdmin" });
    if (!role) {
      role = await Role.create({
        role: "superAdmin",
        roleId: 1,
        Permissions: permissionIds,
        isSuperAdmin: true,
      });
      console.log("SuperAdmin role seeded");
    }
    console.log(role, "role");
    // check user
    const email = "casper@gmail.com";
    let user = await User.findOne({ mail: email });
    if (!user) {
      const hashedPassword = await bcrypt.hash("Casper@200", 10);
      await User.create({
        Name: "Casper",
        mail: email,
        password: hashedPassword,
        role: role._id,
      });
      console.log("SuperAdmin user seeded");
    } else {
      console.log("SuperAdmin user already exists, skipping seeding");
    }
  } catch (err) {
    console.error("Error seeding superAdmin:", err);
  }
};

module.exports = seedSuperAdmin;
