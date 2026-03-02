const Menu = require("../model/MenuSchema");
const Permission = require("../model/permissionSchema");

const seedMenus = async () => {
  try {
    // fetch all permissions
    const permissions = await Permission.find();

    const menus = [
      {
        id: 1,
        MenuName: "Home-view",
        Description: "Main dashboard page",
        access: permissions.map((p) => p._id), // all permissions
      },
      {
        id: 2,
        MenuName: "Edit-datas",
        Description: "User management section",
        access: permissions.map((p) => p._id), // or select specific ones
      },
      {
        id: 3,
        MenuName: "user-Management",
        Description: "System configuration settings",
        access: permissions.map((p) => p._id),
      },
    ];

    for (const menu of menus) {
      const exists = await Menu.findOne({ id: menu.id });
      if (!exists) {
        await Menu.create(menu);
        console.log(`Menu "${menu.MenuName}" seeded`);
      } else {
        console.log(`Menu "${menu.MenuName}" already exists`);
      }
    }
  } catch (err) {
    console.error("Error seeding menus:", err);
  }
};

module.exports = seedMenus;
