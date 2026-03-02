const Permission = require("../model/permissionSchema");

const seedPermissions = async () => {
  const features = [
    { PermissionName: "Create", description: "Create access", id: 1 },
    { PermissionName: "View", description: "View access", id: 2 },
    { PermissionName: "Edit", description: "Edit access", id: 3 },
    { PermissionName: "Delete", description: "Delete access", id: 4 },
    { PermissionName: "Full Access", description: "Full access", id: 5 },
  ];

  try {
    const permissionCount = await Permission.countDocuments();
    if (permissionCount === 0) {
      await Permission.insertMany(features);
      console.log("Permissions seeded successfully");
    } else {
      console.log("Permissions already exist, skipping seeding");
    }
  } catch (err) {
    console.error("Error seeding permissions:", err);
  }
};

module.exports = seedPermissions;
