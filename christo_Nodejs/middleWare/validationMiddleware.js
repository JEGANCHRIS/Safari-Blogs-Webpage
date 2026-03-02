const { body, validationResult, param } = require("express-validator");
const Role = require("../model/RoleModels");

const validateUserCreate = [
  body("Name").notEmpty().withMessage("Name is required"),
  body("mail").notEmpty().isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters"),

  body("role")
    .notEmpty()
    .isMongoId()
    .withMessage("Role must be a valid ObjectId")
    .bail()
    .custom(async (value) => {
      const role = await Role.findById(value);
      if (!role) {
        throw new Error("Role not found in database");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  body("mail").notEmpty().isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateBlogCreate = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateUserIdParam = [
  param("id").isMongoId().withMessage("Invalid user id"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

module.exports = {
  validateUserCreate,
  validateLogin,
  validateBlogCreate,
  validateUserIdParam,
};
