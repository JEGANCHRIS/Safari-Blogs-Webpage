import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import { Title, Meta, Link } from "react-head";

import close from "../assets/cross-red.svg";

export default function BlogEditor({ editingBlog: editingBlogProp }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [cardImage, setCardImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const blogId = editingBlogProp || params.get("id");

  useEffect(() => {
    let mounted = true;
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setCategories(Array.isArray(data) ? data : data.categories || []);
      })
      .catch((err) => {
        console.error("Failed to fetch categories", err);
        setCategories([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!blogId) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/blog/${blogId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blog");
        return res.json();
      })
      .then((blog) => {
        console.log("Fetched blog:", blog);
        if (!mounted) return;
        setTitle(blog.title || "");
        setContent(blog.content || "");
        setIsPublished(!!blog.isPublished);

        setCategory(blog.category?._id || blog.category || "");

        const normalizeImage = (img) => {
          if (!img) return null;
          if (img.startsWith("http")) return img;
          if (img.startsWith("/uploads/"))
            return `${import.meta.env.VITE_API_URL}${img}`;
          return `${import.meta.env.VITE_API_URL}/uploads/${img}`;
        };

        setBannerPreview(normalizeImage(blog.bannerImage));
        setCardPreview(normalizeImage(blog.cardImage));
      })
      .catch((err) => {
        console.error("Error loading blog:", err);
        setMessage({ type: "error", text: "Unable to load blog for editing." });
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [blogId]);

  useEffect(() => {
    return () => {
      if (bannerPreview && bannerPreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
      if (cardPreview && cardPreview.startsWith("blob:")) {
        URL.revokeObjectURL(cardPreview);
      }
    };
  }, [bannerPreview, cardPreview]);

  const onBannerFile = (file) => {
    if (!file) return;
    // revoke previous object URL if we created it
    if (bannerPreview && bannerPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerImage(file);
    setBannerPreview(URL.createObjectURL(file)); // immediate preview
  };

  const onCardFile = (file) => {
    if (!file) return;
    if (cardPreview && cardPreview.startsWith("blob:")) {
      URL.revokeObjectURL(cardPreview);
    }
    setCardImage(file);
    setCardPreview(URL.createObjectURL(file));
  };

  const removeBanner = () => {
    if (bannerPreview && bannerPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(null);
    setBannerImage(null);
  };

  const removeCard = () => {
    if (cardPreview && cardPreview.startsWith("blob:")) {
      URL.revokeObjectURL(cardPreview);
    }
    setCardPreview(null);
    setCardImage(null);
  };

  const handleSave = async () => {
    try {
      setMessage(null);
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = blogId
        ? `${import.meta.env.VITE_API_URL}/api/UpdateBlogs/${blogId}`
        : `${import.meta.env.VITE_API_URL}/api/create-Blogs`;
      const method = blogId ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("isPublished", isPublished ? "true" : "false");
      formData.append("category", category || "");
      // append files only if user selected them
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
      if (!response.ok) {
        setMessage({
          type: "error",
          text: result.message || "Error saving blog.",
        });
        return;
      }

      setMessage({ type: "success", text: "Blog saved successfully!" });
      // short delay then go back to homepage or close
      setTimeout(() => {
        window.location.href = "/"; // redirect back to home (change if needed)
      }, 900);
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: "error", text: "Something went wrong while saving." });
    } finally {
      setLoading(false);
    }
  };
  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file.then(
        (file) =>
          new Promise((resolve, reject) => {
            const data = new FormData();
            data.append("file", file);

            fetch(`${import.meta.env.VITE_API_URL}/api/uploads`, {
              // 👈 match Express route
              method: "POST",
              body: data,
            })
              .then((res) => res.json())
              .then((res) => {
                // 👇 match Express response { url: "..." }
                resolve({
                  default: res.url,
                });
              })
              .catch((err) => reject(err));
          }),
      );
    }

    abort() {
      // optional cancel support
    }
  }

  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  return (
    <>
      {/* <Title>
        {blogId ? "Edit Blog - Safari Blogs" : "Create Blog - Safari Blogs"}
      </Title>
      <Meta
        name="description"
        content={
          blogId
            ? "Edit your existing blog post on Safari Blogs."
            : "Create a new blog post on Safari Blogs."
        }
      />
      <Link rel="canonical" href="http://localhost:5173/blog-editor" /> */}
      <section className="BlogEditorSection">
        <div className="container">
          <div className="blogTab">
            <h2 className="blogHead">
              {blogId ? "Edit Blog" : "Create New Blog"}
            </h2>

            {loading && <p>Loading...</p>}

            <div className="bannerImgBox" style={{ marginBottom: 12 }}>
              <label className="blogLabel">
                + Banner Image
                <input
                  style={{ display: "none" }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onBannerFile(e.target.files?.[0])}
                />
              </label>
              {bannerPreview && (
                <div style={{ marginTop: 8 }}>
                  <img
                    style={{ width: "100%" }}
                    src={bannerPreview}
                    alt="Banner preview"
                    className="banner-img-preview"
                    title={`${title} banner image`}
                    loading="lazy"
                  />
                  <div className="removeFlex">
                    <button
                      className="removeBtn"
                      type="button"
                      onClick={removeBanner}
                    >
                      <img
                        style={{ width: "35px", height: "35" }}
                        className="removeIcon"
                        src={close}
                        alt="close"
                        title="remove"
                        loading="lazy"
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="cardImgBox">
              <label className="blogLabel">
                + Card Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onCardFile(e.target.files?.[0])}
                />
              </label>
              {cardPreview && (
                <div style={{ marginTop: 8 }}>
                  <img
                    style={{ width: "40%" }}
                    src={cardPreview}
                    alt="Card preview"
                    className="card-image-preview"
                    title={`${title} card image`}
                    loading="lazy"
                  />
                  <div className="removeFlex">
                    <button
                      className="removeBtn"
                      type="button"
                      onClick={removeCard}
                    >
                      <img
                        style={{ width: "35px", height: "35" }}
                        className="removeIcon"
                        src={close}
                        alt="close"
                        title="remove"
                        loading="lazy"
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="blogTitle"
              required
            />

            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="dropbox"
            >
              <option value="">-- Select Category --</option>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
            </select>

            <div className="editorContainer" style={{ marginBottom: 12 }}>
              <CKEditor
                editor={ClassicEditor}
                data={content}
                config={{
                  extraPlugins: [MyCustomUploadAdapterPlugin], // custom upload
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "blockQuote",
                    "|",
                    "insertTable",
                    "imageUpload", // 👈 add image upload button
                    "undo",
                    "redo",
                  ],
                  image: {
                    // 👇 enable resize + alignment
                    resizeOptions: [
                      {
                        name: "resizeImage:original",
                        label: "Original",
                        value: null,
                      },
                      {
                        name: "resizeImage:50",
                        label: "50%",
                        value: "50",
                      },
                      {
                        name: "resizeImage:75",
                        label: "75%",
                        value: "75",
                      },
                    ],
                    toolbar: [
                      "imageStyle:inline",
                      "imageStyle:block",
                      "imageStyle:side",
                      "|",
                      "resizeImage", // 👈 resize control
                      "toggleImageCaption",
                      "imageTextAlternative",
                    ],
                  },
                }}
                onChange={(event, editor) => setContent(editor.getData())}
              />
            </div>

            <label className="cbox">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="checkBox"
              />
              {" Publish now?"}
            </label>
            {message && (
              <div
                className={`msg ${
                  message.type === "success" ? "green" : "red"
                }`}
              >
                {message.text}
              </div>
            )}
            <div className="BlogBtnFlex">
              <button
                onClick={handleSave}
                className="saveBtn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Blog"}
              </button>
              <button
                className="CancelBtn"
                onClick={() => {
                  window.location.href = "/";
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
