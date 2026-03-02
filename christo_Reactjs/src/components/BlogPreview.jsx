import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Ckeditor-styles";
// import "@ckeditor/ckeditor5-build-classic/build/content-styles.css";
import "../styles/ckeditor-styles.css";
// import { Title, Meta, Link } from "react-head";
import html2pdf from "html2pdf.js";
import Download from "../assets/download-icon.svg";

function BlogPreview() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const blogRef = useRef();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:3009/api/blog/${id}`);
        setBlog(res.data);
        console.log("Fetched blog:", res.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDownloadPdf = () => {
    if (!blogRef.current) return;
    const element = blogRef.current;
    const options = {
      margin: 0.5,
      filename: `${blog.title || "blog"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true, // ✅ allow cross-origin images
        logging: true, // ✅ helps debug in console
        allowTaint: true, // ✅ needed sometimes for external images
      },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found</p>;

  return (
    <>
      {/* <Title>{blog.title}</Title>
      <Meta name="description" content={blog.content.slice(0, 150)} />
      <Link rel="canonical" href={`http://localhost:5173/blog/${blog._id}`} /> */}
      <section className="blogPreviewSection">
        <div className="container">
          <div className="blogpreContent" ref={blogRef}>
            <p className="categoryName">
              Category: {blog.category?.categoryName || "Uncategorized"}
            </p>
            <div className="liner"></div>
            <h2 className="previewHead">{blog.title}</h2>
            <div
              className="prose ck-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            <p className="publishedPage">
              Published: {blog.isPublished ? "Yes" : "No"}
            </p>
          </div>
          <div className="downloadBox">
            <button onClick={handleDownloadPdf} className="downloadBtn">
              Download{" "}
              <img
                style={{ width: "18px", height: "18px" }}
                className="downloadIcon"
                src={Download}
                alt="download"
                title="download?"
              />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default BlogPreview;
