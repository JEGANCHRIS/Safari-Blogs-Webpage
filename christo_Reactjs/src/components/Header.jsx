import { useState, useEffect, useContext } from "react";
import logoimg from "../assets/siteLog.svg";
import SidePanel from "./SidePannel";
import axios from "axios";
import { Eye, EyeOff, Import } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CategoryContext } from "./Category";
import arrow from "../assets/arrow.svg";

export function HeaderSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSubmenu, setShowSubMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const { setSelectedCategory } = useContext(CategoryContext);
  const navigate = useNavigate();
  const userRole =
    typeof user?.role === "object" ? user?.role?.name : user?.role;

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => {
        console.log("API response:", res.data);
        setCategories(res.data.categories);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLogin(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLogin(false);
      setUser(null);
    }
    const handleStorageChange = () => {
      const newUserData = localStorage.getItem("user");
      const newToken = localStorage.getItem("token");
      if (newUserData && newToken) {
        setIsLogin(true);
        setUser(JSON.parse(newUserData));
      } else {
        setIsLogin(false);
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLogin(false);
    setUser(null);
    setShowProfile(false);
    navigate("/");
    window.location.reload();
  };
  //login
  const [credinals, setCredinals] = useState({ mail: "", password: "" });
  const handleChange = (e) => {
    setCredinals({ ...credinals, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://safari-blogs-webpage-2.onrender.com/api/login",
        credinals
      );
      const token = res.data?.token;
      const UserData = res.data?.user;
      if (token && UserData) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(UserData));
        setIsLogin(true);
        setUser(UserData);
        setShowLogin(false);
        console.log("Admin token saved:", token);
        console.log("Login Sucessfull:", UserData);
        window.location.reload();
      } else {
        console.error("Login failed:", err.response?.data || err.message);
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    }
  };
  //register
  const [formData, setFormData] = useState({
    Name: "",
    mail: "",
    password: "",
    role: "68a42096c7abd028e283366e",
  });

  const handleSave = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Admin is not authenticated. Please log in.");
      return;
    }
    try {
      const res = await axios.post(
        "https://safari-blogs-webpage-2.onrender.com/api/Create-Users",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("user Created:", res.data);
      setShowRegister(false);
      setShowLogin(true);
    } catch (err) {
      console.error("Error creating user:", err.response?.dat || err.message);
    }
  };

  return (
    <header>
      <div className="container">
        <div className="navBar">
          <div className="logo">
            <img
              style={{ width: "75px", height: "72" }}
              className="main-logo"
              src={logoimg}
              alt="logo"
              title="siteLogo"
              loading="lazy"
            />
          </div>
          <div className="menu">
            <ul className="menu-box">
              <li className="menu-li">
                <button className="menuBtn">
                  {" "}
                  <a href="/" title="home" className="link">
                    Home
                  </a>{" "}
                </button>
              </li>
              {isLogin && user?.role !== "68a42096c7abd028e283366e" && (
                <li className="menu-li">
                  <button className="menuBtn">
                    {" "}
                    <a
                      className="link"
                      title="userManagement"
                      href="/UserManagement"
                    >
                      UserManagement
                    </a>{" "}
                  </button>
                </li>
              )}
              <li className="menu-li">
                <button className="menuBtn">
                  {" "}
                  <a className="link" title="Draft" href="/drafts">
                    Draft
                  </a>{" "}
                </button>
              </li>
              <li
                className="menu-li"
                onMouseEnter={() => setShowSubMenu(true)}
                onMouseLeave={() => setShowSubMenu(false)}
              >
                <button className="menuBtn catBtn">
                  Categories{" "}
                  <img
                    style={{ width: "18px", height: "12" }}
                    className="arrow"
                    src={arrow}
                    alt="arrow"
                    title="category"
                    loading="lazy"
                  />
                </button>
                {showSubmenu && (
                  <ul className="s-menu-list">
                    {categories.map((cat) => (
                      <li key={cat._id}>
                        <button
                          className="s-menu-btn"
                          onClick={() => {
                            navigate("/", {
                              state: {
                                category: cat.categoryName,
                                scrollTo: "Blogs",
                              },
                            });

                            // navigate("/");
                            // setSelectedCategory(cat.categoryName);
                            // document
                            //   .getElementById("Blogs")
                            //   ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          {cat.categoryName}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li className="menu-li">
                <button
                  className="menuBtn"
                  onClick={() => {
                    document
                      .getElementById("Con")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {" "}
                  Contact us
                </button>
              </li>
            </ul>
          </div>
          <div className="logBtn">
            {!isLogin ? (
              <>
                <button className="Login" onClick={() => setShowLogin(true)}>
                  LogIn
                </button>
                <button
                  className="NewRegister"
                  onClick={() => setShowRegister(true)}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button className="menuBtn" onClick={handleLogOut}>
                  Log Out
                </button>
                <button
                  className="NewRegister"
                  onClick={() => setShowRegister(true)}
                >
                  Register
                </button>
                <button
                  className="menuBtn"
                  onClick={() => setShowProfile(true)}
                >
                  {user?.Name || "Profile"}
                </button>
              </>
            )}
          </div>
          <button className="burgerMenu" onClick={toggleMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>
        </div>
        <div className={`flex-burger ${isMenuOpen ? "active" : ""}`}>
          {isMenuOpen && (
            <button className="closeBtn" onClick={() => setIsMenuOpen(false)}>
              <div className="cbar bar1"></div>
              <div className="cbar bar2"></div>
            </button>
          )}
          <div className=""></div>
          <div className="b-menu-contents">
            <ul className="burger-box">
              {!isLogin ? (
                <>
                  <li className="burger-li" onClick={() => setShowLogin(true)}>
                    Login
                  </li>
                  <li
                    className="burger-li"
                    onClick={() => setShowRegister(true)}
                  >
                    Register
                  </li>
                </>
              ) : (
                <>
                  <li className="burger-li">
                    <button
                      className="menuBtn"
                      onClick={() => setShowProfile(true)}
                    >
                      {user?.Name || "Profile"}
                    </button>
                  </li>
                  <li className="burger-li">
                    <button
                      className="menuBtn"
                      onClick={() => setShowRegister(true)}
                    >
                      Register
                    </button>
                  </li>
                  <li className="burger-li">
                    <button className="menuBtn" onClick={handleLogOut}>
                      Log Out
                    </button>
                  </li>
                </>
              )}
              <li className="burger-li">
                <button className="menuBtn">
                  <a href="/" className="link" title="home">
                    Home
                  </a>
                </button>
              </li>
              {isLogin && user?.role !== "User" && (
                <>
                  <li className="burger-li">
                    <button className="menuBtn">
                      {" "}
                      <a href="#" className="link" title="userManagement">
                        UserManagement
                      </a>{" "}
                    </button>
                  </li>
                </>
              )}
              <li className="burger-li">
                <button className="menuBtn">
                  {" "}
                  <a href="/drafts" className="link" title="Draft">
                    Draft
                  </a>{" "}
                </button>
              </li>

              <li className="burger-li">
                <button
                  className="menuBtn"
                  onClick={() => {
                    document
                      .getElementById("Con")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>
        <SidePanel
          isOpen={showProfile}
          onClose={() => {
            setShowProfile(false);
          }}
        >
          <div className="profile-container">
            <p className="profile-title">My Profile</p>

            <div className="profile-info">
              <p className="profilecontent">
                <span className="profileinfo">Name:</span> {user?.Name}
              </p>
              <p className="profilecontent">
                <span className="profileinfo">Email:</span> {user?.mail}
              </p>
              <p className="profilecontent">
                <span className="profileinfo">Role:</span> {user?.role}
              </p>
            </div>

            <div className="profile-actions">
              <button
                className="logoutBtn"
                onClick={handleLogOut}
                // onClose={() => {
                //   setShowProfile(false);
                // }}
              >
                Log Out
              </button>
            </div>
          </div>
        </SidePanel>
        <SidePanel
          isOpen={showLogin}
          onClose={() => {
            setShowLogin(false);
          }}
        >
          <p className="LoginHeading">Login</p>
          <form className="loginForm" onSubmit={handleLogin}>
            <input
              className="inputBars"
              type="email"
              name="mail"
              placeholder="Email"
              required
              onChange={handleChange}
            />

            <div className="passwordBox">
              <input
                className="inputBars pass"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eyebtn"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>

            <button className="loginButton" type="submit">
              Login
            </button>

            <a
              href="#"
              onClick={() => {
                setShowRegister(true);
                setShowLogin(false);
              }}
              title="register new user"
              className="newUser"
            >
              Create New User
            </a>
          </form>
        </SidePanel>
        <SidePanel
          isOpen={showRegister}
          onClose={() => {
            setShowRegister(false);
          }}
        >
          <p className="RegHeading">Register</p>
          <form className="regForm" onSubmit={handleSubmit}>
            <input
              className="inputBars"
              type="text"
              placeholder="Name"
              required
              name="Name"
              onChange={handleSave}
            />
            <input
              className="inputBars"
              type="email"
              placeholder="Email"
              required
              onChange={handleSave}
              name="mail"
            />
            <div className="passwordBox">
              <input
                className="inputBars pass"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eyebtn"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            <button className="regButton" type="submit">
              Register
            </button>
            <a
              href="#"
              onClick={() => {
                setShowLogin(true), setShowRegister(false);
              }}
              title="already have an account?"
              className="alreadyAnUser"
            >
              User Login
            </a>
          </form>
        </SidePanel>
      </div>
    </header>
  );
}
