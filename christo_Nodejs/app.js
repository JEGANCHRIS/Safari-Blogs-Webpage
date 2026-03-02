const express = require("express");
const mongoose = require("mongoose");
const routes = require("./router/userRouter");
const seedSuperAdmin = require("./seed/seeder");
const seedMenus = require("./seed/MenuSeed");
const seedPermissions = require("./seed/seedPermissions");
const cors = require("cors");
// const seedRoles = require("./seed/seedRoles");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure you create an "uploads" folder in backend root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


// Upload API for CKEditor
app.post("/api/uploads", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `http://localhost:3009/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB
mongoose
  .connect("mongodb://localhost:27017/userManagement", { autoIndex: true })
  .then(async () => {
    console.log("Connected to MongoDB userManagement");
    await seedSuperAdmin();
    await seedMenus();
    await seedPermissions();
    // await seedRoles();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", routes);

module.exports = { app };
