const Menu = require("../model/MenuSchema");
const Permission = require("../model/permissionSchema");

// Create a menu and assign permissions
// exports.createMenu = async (req, res) => {
//   console.log(req, "req.body");
//   try {
//     const { MenuName, Description, id, access } = req.body;

//     const newMenu = await Menu.create({
//       MenuName,
//       Description,
//       id,
//       access,
//     });

//     res.status(201).json({
//       message: "Menu created successfully",
//       data: newMenu,
//     });
//   } catch (err) {
//     console.error("Error creating menu:", err); // log full error in console
//     res.status(500).json({
//       message: "Server error",
//       error: err.message, // <-- send back the actual error
//       stack: err.stack, // <-- optional, for debugging
//     });
//   }
// };

// Get all menus with permissions populated
exports.getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate(
      "access",
      "PermissionName description id"
    );
    res.status(200).json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ message: "Server error" });
  }
};
