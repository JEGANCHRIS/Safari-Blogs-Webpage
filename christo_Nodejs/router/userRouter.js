const express = require("express");
const router = express.Router();
const Role = require("../model/RoleModels");
const auth = require("../middleWare/authMiddleware");
const { allow, roleIn } = require("../middleWare/Permissions");
const rateLimit = require("../middleWare/rateLimiters");
const {
  validateUserCreate,
  validateLogin,
  validateBlogCreate,
  validateUserIdParam,
} = require("../middleWare/validationMiddleware");
const authCtrl = require("../controllers/authController");
const userCtrl = require("../controllers/userController");
const blogCtrl = require("../controllers/blogController");
const menuCtrl = require("../controllers/menuController");
const contactCtrl = require("../controllers/ContactController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/** Auth */
router.post("/login", validateLogin, rateLimit(), authCtrl.login);

router.post(
  "/users/super-admin",
  rateLimit(),
  validateUserCreate,
  userCtrl.createSuperAdmin,
);

router.post(
  "/users/admin",
  auth,
  roleIn(["superAdmin"]),
  rateLimit(),
  validateUserCreate,
  userCtrl.createAdmin,
);

router.post(
  "/Create-Users",
  auth,
  roleIn(["superAdmin", "Admin"]),
  rateLimit(),
  validateUserCreate,
  userCtrl.createUser,
);
router.put(
  "/users/:id",
  auth,
  roleIn(["Admin", "superAdmin"]),
  rateLimit(),
  validateUserIdParam,
  userCtrl.updateUser,
);
router.delete(
  "/delete-user/:id",
  auth,
  roleIn(["Admin", "superAdmin"]),
  userCtrl.deleteUser,
);
router.get("/roles", async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get(
  "/GetAllUsers",
  auth,
  roleIn(["Admin", "superAdmin"]),
  userCtrl.getAllUsers,
);

/** login as any user*/
router.post("/loginAsUser/:id", auth, authCtrl.loginAsUser, rateLimit());

/** Blogs */
router.post(
  "/create-Blogs",
  auth,
  rateLimit(),
  upload.fields([{ name: "bannerImage" }, { name: "cardImage" }]),
  validateBlogCreate,
  blogCtrl.createBlog,
);
router.put(
  "/UpdateBlogs/:id",
  auth,
  rateLimit(),
  upload.fields([{ name: "bannerImage" }, { name: "cardImage" }]),
  blogCtrl.updateBlog,
);
router.get("/blog/:id", blogCtrl.BlogById);
router.get("/GetMyblogs/users", auth, blogCtrl.getMyBlogs);
router.get(
  "/getallblogs",
  auth,
  roleIn(["admin", "superAdmin"]),
  blogCtrl.getAllBlogs,
);
router.get("/getmyblogs", auth, blogCtrl.getMyBlogs);
router.delete("/deleteBlog/:id", auth, rateLimit(), blogCtrl.deleteBlog);
/** category */
router.post("/create-category", auth, userCtrl.createCategory);
router.get("/categories", userCtrl.getAllCategory);
//role create/get
router.post("/CreateRoles", userCtrl.createRole);
router.get("/GetRoles", userCtrl.getRoles);
// router.post("/createMenu", menuCtrl.createMenu);
router.get("/getMenu", menuCtrl.getAllMenus);
//contactUs

router.post("/contactUs", contactCtrl.ContactUs);

module.exports = router;
