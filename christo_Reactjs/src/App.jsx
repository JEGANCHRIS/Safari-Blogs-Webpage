import { useState } from "react";
import "./App.css";
import { HeaderSection } from "./components/Header";
import { BannerSection } from "./components/bannerSection";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogPreview from "./components/BlogPreview";
import UserManagement from "./components/UserManagement";
import Draft from "./components/Draft";
import { ContactUs } from "./components/ContactUs";
import { Footer } from "./components/Footer";
import { CategoryContext } from "./components/Category";
import BlogEditor from "./components/BlogEditor";
import Layout from "./components/Layout";
import Canonical from "./components/canonical";

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      <div className="page-wrapper">
        <Router>
          <Canonical />
          <HeaderSection />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<BannerSection />} />
              <Route path="blog-editor" element={<BlogEditor />} />
              <Route path="blog/:id" element={<BlogPreview />} />
              <Route path="UserManagement" element={<UserManagement />} />
              <Route path="drafts" element={<Draft />} />
            </Route>
          </Routes>
          <ContactUs />
          <Footer />
        </Router>
      </div>
    </CategoryContext.Provider>
  );
}

export default App;
