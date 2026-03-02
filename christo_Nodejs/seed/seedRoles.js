const Permission = require("../model/permissionSchema");
const Role = require("../model/RoleModels");

const seedRoles = async () => {
  try {
    // Fetch all permissions (already seeded)
    const permissions = await Permission.find();

    // helper: find by name
    const findPerm = (name) =>
      permissions.find((p) => p.PermissionName === name);

    // Define role structure with assigned permissions
    const roles = [
      {
        role: "superAdmin",
        roleId: 1,
        Permissions: permissions.map((p) => p._id), // all permissions
        isSuperAdmin: true,
      },
      {
        role: "Admin",
        roleId: 2,
        Permissions: [
          findPerm("Create")?._id,
          findPerm("View")?._id,
          findPerm("Edit")?._id,
          findPerm("Delete")?._id,
        ].filter(Boolean),
      },
      {
        role: "User",
        roleId: 3,
        Permissions: [findPerm("Create")?._id, findPerm("View")?._id].filter(
          Boolean
        ),
      },
    ];

    // Seed roles if not already present
    for (const r of roles) {
      const exists = await Role.findOne({ role: r.role });
      if (!exists) {
        await Role.create(r);
        console.log(`Role "${r.role}" seeded`);
      } else {
        console.log(`Role "${r.role}" already exists`);
      }
    }
  } catch (err) {
    console.error("Error seeding roles:", err);
  }
};

module.exports = seedRoles;
