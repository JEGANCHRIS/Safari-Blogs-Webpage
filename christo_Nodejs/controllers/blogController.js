const Blog = require("../model/BlogSchema");

// when user uploads jpg||png||webp formate it always converts and store in backend into svg.

// User/Admin/SuperAdmin: create
exports.createBlog = async (req, res) => {
  try {
    const { title, content, isPublished, category } = req.body;

    const blog = await Blog.create({
      title,
      content,
      isPublished: !!isPublished,
      author: req.user.id,
      category,
      bannerImage: req.files.bannerImage
        ? `/uploads/${req.files.bannerImage[0].filename}`
        : null,
      cardImage: req.files.cardImage
        ? `/uploads/${req.files.cardImage[0].filename}`
        : null,
    });
    res.status(201).json({ message: "Blog created", blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/SuperAdmin: update any blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const isOwner = String(blog.author) === String(req.user.id);
    const role = req.user?.role?.role;
    const canUpdateAny = role === "admin" || role === "superAdmin";
    const canUpdateOwn = role === "user";

    if (!(canUpdateAny || (canUpdateOwn && isOwner))) {
      return res.status(403).json({ message: "Access denied-2" });
    }

    const payload = {};
    ["title", "content", "isPublished", "category"].forEach((k) => {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    });

    if (req.files.bannerImage) {
      payload.bannerImage = `/uploads/${req.files.bannerImage[0].filename}`;
    }

    if (req.files.cardImage) {
      payload.cardImage = `/uploads/${req.files.cardImage[0].filename}`;
    }

    const updated = await Blog.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );

    res.json({ message: "Blog updated", blog: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.BlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("category");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Optional: list/get
exports.getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .populate("category", "categoryName")
      .sort({
        createdAt: -1,
      });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// get all blog
exports.getAllBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "Name role")
      .populate("category", "categoryName description");

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// User: delete own blog
// Admin/SuperAdmin: delete any blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find blog
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const isOwner = String(blog.author) === String(req.user.id);

    // Permission check
    const roleName = req.user?.role?.role || req.user?.role;
    const canDeleteAny = roleName === "admin" || roleName === "superAdmin";
    const canDeleteOwn = roleName === "user";

    if (!(canDeleteAny || (canDeleteOwn && isOwner))) {
      return res
        .status(403)
        .json({ message: "Access denied - cannot delete this blog" });
    }

    // Delete blog
    await Blog.findByIdAndDelete(id);

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
