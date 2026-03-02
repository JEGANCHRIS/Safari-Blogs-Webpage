import { useState, useEffect, useContext } from "react";
import SidePanel from "./SidePannel";
import axios from "axios";
import EditIcon from "../assets/edit-icon.svg";
import DeleteIcon from "../assets/delete.svg";
import Lion from "../assets/banana.svg";
import { CategoryContext } from "./Category";
// import { Title, Meta, Link } from "react-head";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function BannerSection() {
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [content, setContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [message, setMessage] = useState(null);
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const { selectedCategory, setSelectedCategory } = useContext(CategoryContext);
  const [bannerImage, setBannerImage] = useState(null);
  const [cardImage, setCardImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    } else if (location.state === null || location.state === undefined) {
      // Reset ONLY on fresh homepage visit with no state
      setSelectedCategory(null);
    }

    if (location.state?.scrollTo) {
      const target = document.getElementById(location.state.scrollTo);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
          // ✅ keep category, just remove scrollTo
          navigate(location.pathname, {
            replace: true,
            state: { category: location.state.category || null },
          });
        }, 200);
      }
    }
  }, [location, setSelectedCategory, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3009/api/categories");
        const data = await res.json();
        console.log("Fetched categories response:", data);
        setCategories(data.categories || data || []); // <-- be flexible
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3009/api/getmyblogs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : data.blogs || []);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      }
    };

    fetchBlogs();

    fetchCategories();
    const token = localStorage.getItem("token");

    if (token) {
      setIsLogin(true);
    }
  }, []);

  const handleCreateNew = () => {
    window.open("/blog-editor", "_blank");
  };

  const handleEdit = (blog) => {
    setTitle(blog.title);
    setContent(blog.content);
    setIsPublished(blog.isPublished);
    setCategory(blog.category?._id || blog.category);
    if (blog.bannerImage) {
      setBannerPreview(`http://localhost:3009/${blog.bannerImage}`);
    }
    if (blog.cardImage) {
      setCardPreview(`http://localhost:3009/${blog.cardImage}`);
    }

    setEditingBlog(blog._id);

    window.open(`/blog-editor?id=${blog._id}`, "_blank");
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = editingBlog
        ? `http://localhost:3009/api/UpdateBlogs/${editingBlog}`
        : "http://localhost:3009/api/create-Blogs";

      const method = editingBlog ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("isPublished", isPublished);
      formData.append("category", category);
      if (bannerImage) formData.append("bannerImage", bannerImage);
      if (cardImage) formData.append("cardImage", cardImage);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "Blog created successfully!!" });
        console.log("Saved blog", result.blog);

        // reset
        setTitle("");
        setContent("");
        setIsPublished(false);
        setCategory("");
        setEditingBlog(null);
        setShowCreateBlog(false);
        setBannerImage(null);
        setCardImage(null);
        setBannerPreview(null);
        setCardPreview(null);

        // reload blogs
        const updated = await fetch("http://localhost:3009/api/getmyblogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedData = await updated.json();
        setBlogs(
          Array.isArray(updatedData) ? updatedData : updatedData.blogs || []
        );
      } else {
        setMessage({
          type: "error",
          text: result.message || "Error saving blog!!!",
        });
      }
    } catch (err) {
      console.error("error saving blog", err);
      setMessage({ type: "error", text: "Something went wrong!!!" });
    } finally {
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleDeleteConfirm = (id) => {
    setBlogToDelete(id);
    setShowDeleteConfirm(true);
  };
  const handleDelete = async (id) => {
    if (!blogToDelete) return;
    try {
      await axios.delete(
        `http://localhost:3009/api/deleteBlog/${blogToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage({ type: "success", text: "Blog deleted successfully!!" });
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog._id !== blogToDelete)
      );
      fetchBlogs();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      // setMessage({ type: "error", text: "Failed to delete blog!!" });
    } finally {
      setShowDeleteConfirm(false);
      setBlogToDelete(null);
      setTimeout(() => setMessage(null), 2000);
    }
  };
  const filteredBlogs = selectedCategory
    ? blogs.filter(
        (blog) =>
          blog.isPublished === true &&
          blog.category?.categoryName === selectedCategory
      )
    : blogs.filter((blog) => blog.isPublished === true);

  const blogsPerPage = 12;
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + blogsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return (
    <>
      <section className="bannerSection">
        <div className="container">
          <div className="bannerContent">
            <p className="bannerText">Let's Dive into Sea of knowledge</p>
            <h1>Safari Blogs</h1>
            <h2 className="bannerSub">
              Learn both in-&-out for gain knowledge because{" "}
              <span className="span1">"Half knowledge is Dangerous"</span>
            </h2>
          </div>
          <div className="BlogBox" id="Blogs">
            <div className="BlogsArea">
              {!isLogin ? (
                <div
                  className="createBtn"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <div className="suggestContainer">
                    <p className="loginSuggest">Please Login to create blogs</p>
                    <img
                      style={{ width: "180px", height: "180" }}
                      className="lionImg"
                      src={Lion}
                      alt="Bgimage"
                      title="BgImage"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : (
                <div className="createBtn">
                  <button
                    className="newBlogCreateBtn"
                    onClick={handleCreateNew}
                  >
                    +Create New Blog
                  </button>
                </div>
              )}

              {message && (
                <div
                  className={`msg ${
                    message.type === "success" ? "green" : "red"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {blogs.length === 0 ? (
                <p className="noBlogs">No blogs yet.</p>
              ) : (
                <>
                  <div className="BlogListGrid">
                    {currentBlogs.map((blog) => {
                      const cardImg = blog.cardImage
                        ? blog.cardImage.startsWith("http")
                          ? blog.cardImage
                          : `http://localhost:3009/${blog.cardImage.replace(
                              /^\/+/,
                              ""
                            )}`
                        : "https://via.placeholder.com/300x180?text=No+Image";

                      return (
                        <div key={blog._id} className="blogCard">
                          <a
                            href={`/blog/${blog._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={blog.title}
                          >
                            <img
                              style={{ width: "100%", height: "180px" }}
                              src={cardImg}
                              alt={blog.title}
                              className="blogCardImage"
                              title={blog.title}
                              loading="lazy"
                            />
                          </a>
                          <div className="blogCardContent">
                            <h3 className="blogCardTitle">{blog.title}</h3>
                            <p className="blogCardMeta">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                            <div className="cardActions">
                              <button
                                onClick={() => handleEdit(blog)}
                                className="editBtn"
                              >
                                <img
                                  style={{ width: "25px", height: "25" }}
                                  src={EditIcon}
                                  alt="edit"
                                  className="editIcon"
                                  title="edit?"
                                  loading="lazy"
                                />
                              </button>
                              <button
                                onClick={() => handleDeleteConfirm(blog._id)}
                                className="delBtn"
                              >
                                <img
                                  style={{ width: "25px", height: "25" }}
                                  src={DeleteIcon}
                                  alt="delete"
                                  className="delIcon"
                                  title="Delete?"
                                  loading="lazy"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pageiniation">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`numBtn ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <SidePanel
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            size="small"
          >
            <p className="cautionTxt">
              Are you sure you want to delete this blog?
            </p>
            <div className="flexcaution">
              <button
                className="caution"
                onClick={() => handleDelete(blogToDelete)}
              >
                Yes
              </button>
              <button
                className="caution"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBlogToDelete(null);
                }}
              >
                No
              </button>
            </div>
          </SidePanel>
        </div>
      </section>
    </>
  );
}
