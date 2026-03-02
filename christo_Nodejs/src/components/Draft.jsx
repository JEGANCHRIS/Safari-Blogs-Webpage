import { useState, useEffect } from "react";
import axios from "axios";
import SidePanel from "./SidePannel";
import { useNavigate } from "react-router-dom";
import EditIcon from "../assets/edit-icon.svg";
import DeleteIcon from "../assets/delete.svg";
// import { Title, Meta, Link } from "react-head";

const Draft = () => {
  const [draft, setDraft] = useState([]);
  const navigate = useNavigate();
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);

  const fetchBlog = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3009/api/GetMyblogs/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const draftBlogs = await res.data.filter(
        (blog) => blog.isPublished === false
      );
      setDraft(draftBlogs);
    } catch (err) {
      console.error("error fetching drafts:", err);
    }
  };
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

    fetchBlog();

    fetchCategories();
  }, []);

  const handleEdit = (blog) => {
    setTitle(blog.title);
    setContent(blog.content);
    setIsPublished(blog.isPublished);
    setCategory(blog.category?._id || blog.category); // if populated
    setEditingBlog(blog._id);
    if (blog.bannerImage) {
      setBannerPreview(`http://localhost:3009/${blog.bannerImage}`);
    }
    if (blog.cardImage) {
      setCardPreview(`http://localhost:3009/${blog.cardImage}`);
    }
    window.open(`/blog-editor?id=${blog._id}`, "_blank");
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = editingBlog
        ? `http://localhost:3009/api/UpdateBlogs/${editingBlog}`
        : "http://localhost:3009/api/create-Blogs";

      const method = editingBlog ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          isPublished,
          category,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "Blog saved successfully!!" });
        console.log("Saved blog", result.blog);

        // reset form
        setTitle("");
        setContent("");
        setIsPublished(false);
        setCategory("");
        setEditingBlog(null);
        setShowCreateBlog(false);

        fetchBlog();
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
  const handleCreateNew = () => {
    window.open("/blog-editor", "_blank");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3009/api/deleteBlog/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage({ type: "success", text: "Blog deleted successfully!!" });

      setDraft((prevDraft) => prevDraft.filter((blog) => blog._id !== id));
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setMessage({ type: "error", text: "Failed to delete blog!!" });
    } finally {
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <>
      <section className="DraftSection">
        <div className="container">
          <div className="DraftContent">
            <h2 className="umHeading">Your Drafts</h2>
            <div className="BlogBox">
              <h1 className="font-bold">Draft Blogs</h1>
              {draft.length === 0 ? (
                <p>No drafts available</p>
              ) : (
                <div className="BlogListGrid">
                  {draft.map((blog) => {
                    const cardImg = blog.cardImage
                      ? blog.cardImage.startsWith("http")
                        ? blog.cardImage
                        : `http://localhost:3009/${blog.cardImage.replace(
                            /^\/+/,
                            ""
                          )}`
                      : "https://via.placeholder.co/300x180?text=No+Image";

                    return (
                      <div key={blog._id} className="blogCard">
                        <a
                          title={blog.title}
                          href={`/blog/${blog._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold"
                        >
                          <img
                            style={{ width: "100%", height: "180" }}
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
                              onClick={() => handleDelete(blog._id)}
                              className="delBtn"
                            >
                              <img
                                style={{ width: "25px", height: "25" }}
                                src={DeleteIcon}
                                alt="delete"
                                className="delIcon"
                                title="delete?"
                                loading="lazy"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Draft;
