import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import EditIcon from "../assets/edit-icon.svg";
import DeleteIcon from "../assets/delete.svg";
import tick from "../assets/check.svg";
import cross from "../assets/cross.svg";
import SidePanel from "./SidePannel";
import { Eye, EyeOff } from "lucide-react";
// import { Title, Meta, Link } from "react-head";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem("token");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showCaution, setShowCaution] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    mail: "",
    password: "",
    role: "68a420f2c7abd028e2833671",
  }); // for admin creation
  const [userInput, setUserInput] = useState({
    Name: "",
    mail: "",
    password: "",
    role: "68a42096c7abd028e283366e",
  }); // for user creation
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loginUser, setLoginUser] = useState(null);
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);

  //   const [credinals, setCredinals] = useState({ mail: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSave = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const role = storedUser?.role;

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/GetAllUsers?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      let allUsers = [];
      if (res.data && res.data.Datas) {
        Object.values(res.data.Datas).forEach((group) => {
          if (Array.isArray(group)) {
            allUsers.push(...group);
          } else {
            allUsers.push(group);
          }
        });
      }

      allUsers = allUsers.filter((u) => !u.isSuperAdmin);

      setUsers(allUsers);
      setTotalPages(res.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };
  const resetForm = () => {
    setFormData({
      Name: "",
      mail: "",
      password: "",
      role: "68a420f2c7abd028e2833671",
    });
  };
  const resetUserForm = () => {
    setUserInput({
      Name: "",
      mail: "",
      password: "",
      role: "68a42096c7abd028e283366e",
    });
  }; // for user creation

  useEffect(() => {
    setSearchParams({ page });
  }, [page, setSearchParams]);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  //login as any user

  const handleLoginAsUser = async (userId) => {
    try {
      const res = await axios.post(
        `https://safari-blogs-webpage-2.onrender.com/api/loginAsUser/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);

        // safe guard: only set user if exists
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        setShowLoginConfirm(false);
        setLoginUser(null);
        window.location.href = "/";
      } else {
        console.error("loginAsUser response missing token", res.data);
      }
    } catch (err) {
      console.error("Error logging in as user:", err);
    }
  };

  // Update user
  const handleUpdate = async (id, data) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
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
        userInput,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("user Created:", res.data);
      setShowUserForm(false);
      resetUserForm();
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err.response?.dat || err.message);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Admin is not authenticated. Please log in.");
      return;
    }

    try {
      const res = await axios.post(
        "https://safari-blogs-webpage-2.onrender.com/api/users/admin",
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("Admin created:", res.data);
      setShowAdminForm(false);
      resetForm();
    } catch (err) {
      console.error("Error creating Admin:", err.response?.dat || err.message);
    }
  };

  // Delete user
  const handleDelete = (id) => {
    setConfirmDelete(id);
    setShowCaution(true);
  };

  // Final delete action
  const confirmDeleteUser = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/delete-user/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchUsers();
      setConfirmDelete(null);
      setShowCaution(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <>
      <section className="UserManagementSection">
        <div className="container">
          <div className="usermanagementContent">
            <h1 className="umHeading">User Management</h1>

            <div className="createFlex">
              <button className="create" onClick={() => setShowUserForm(true)}>
                + Create New User
              </button>
              {role === "superAdmin" && (
                <button
                  className="create"
                  onClick={() => setShowAdminForm(true)}
                >
                  + Create New Admin
                </button>
              )}
            </div>

            <table className="UserTable">
              <thead>
                <tr className="tableRowBox">
                  <th className="tableRows">Name</th>
                  <th className="tableRows">Email</th>
                  <th className="tableRows">Role</th>
                  <th className="tableRows">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="userName">
                      {editingUser?._id === u._id ? (
                        <input
                          className="editInputName"
                          defaultValue={u.Name}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              Name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <button
                          className="accountBtn"
                          onClick={() => {
                            setLoginUser(u);
                            setShowLoginConfirm(true);
                          }}
                        >
                          {u.Name}
                        </button>
                      )}
                    </td>
                    <td className="mailInput">
                      {editingUser?._id === u._id ? (
                        <input
                          className="editInputMail"
                          defaultValue={u.mail}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              mail: e.target.value,
                            })
                          }
                        />
                      ) : (
                        u.mail
                      )}
                    </td>
                    <td className="userRole">{u.role}</td>
                    <td className="btnColoum">
                      {editingUser?._id === u._id ? (
                        <div className="btnFlex">
                          <button
                            className="modifyBtn"
                            onClick={() => handleUpdate(u._id, editingUser)}
                          >
                            <img
                              style={{ width: "20px", height: "20" }}
                              src={tick}
                              alt="edit"
                              title="save?"
                              className="saveIcon"
                              loading="lazy"
                            />
                          </button>
                          <div className="straightLine1"></div>
                          <button
                            className="modifyBtn"
                            onClick={() => setEditingUser(null)}
                          >
                            <img
                              style={{ width: "20px", height: "20" }}
                              src={cross}
                              alt="edit"
                              title="cancel?"
                              className="CrossIcon"
                              loading="lazy"
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="btnFlex">
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded modifyBtn"
                            onClick={() => setEditingUser(u)}
                          >
                            <img
                              style={{ width: "25px", height: "25" }}
                              src={EditIcon}
                              alt="edit"
                              className="editIcon penIcon"
                              title="edit?"
                              loading="lazy"
                            />
                          </button>

                          {role === "superAdmin" && (
                            <>
                              <div className="straightLine1"></div>
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded ml-2 modifyBtn"
                                onClick={() => handleDelete(u._id)}
                              >
                                <img
                                  style={{ width: "25px", height: "25" }}
                                  src={DeleteIcon}
                                  alt="delete"
                                  className="delIcon dustBin"
                                  title="delete?"
                                  loading="lazy"
                                />
                              </button>
                            </>
                          )}

                          {confirmDelete === u._id && (
                            <SidePanel
                              isOpen={showCaution}
                              onClose={() => {
                                setShowCaution(false);
                                setConfirmDelete(null);
                              }}
                            >
                              {" "}
                              <p className="cautionTxt">
                                {" "}
                                Are you sure you want to delete this user?{" "}
                              </p>{" "}
                              <div className="flexcaution">
                                {" "}
                                <button
                                  className="caution"
                                  onClick={() =>
                                    confirmDeleteUser(confirmDelete)
                                  }
                                >
                                  {" "}
                                  Yes{" "}
                                </button>{" "}
                                <button
                                  className="caution"
                                  onClick={() => {
                                    setShowCaution(false);
                                    setConfirmDelete(null);
                                  }}
                                >
                                  {" "}
                                  No{" "}
                                </button>{" "}
                              </div>{" "}
                            </SidePanel>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pageiniation">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`numBtn ${page === i + 1 ? "active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <SidePanel
              isOpen={showAdminForm}
              onClose={() => setShowAdminForm(false)}
            >
              <h2 className="RegHeading">Register Admin</h2>
              <form className="regForm" onSubmit={handleCreateAdmin}>
                <input
                  className="inputBars"
                  type="text"
                  placeholder="Name"
                  required
                  name="Name"
                  onChange={handleChange}
                  value={formData.Name}
                />
                <input
                  className="inputBars"
                  type="email"
                  placeholder="Email"
                  required
                  name="mail"
                  onChange={handleChange}
                  value={formData.mail}
                />
                <div className="passwordBox">
                  <input
                    className="inputBars pass"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    onChange={handleChange}
                    value={formData.password}
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
              </form>
            </SidePanel>
            {/* user creation form panel */}
            <SidePanel
              isOpen={showUserForm}
              onClose={() => setShowUserForm(false)}
            >
              <h2 className="RegHeading">Register User</h2>
              <form className="regForm" onSubmit={handleSubmit}>
                <input
                  className="inputBars"
                  type="text"
                  placeholder="Name"
                  required
                  name="Name"
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      [e.target.name]: e.target.value,
                    })
                  }
                  value={userInput.Name}
                />
                <input
                  className="inputBars"
                  type="email"
                  placeholder="Email"
                  required
                  name="mail"
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      [e.target.name]: e.target.value,
                    })
                  }
                  value={userInput.mail}
                />
                <div className="passwordBox">
                  <input
                    className="inputBars pass"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    onChange={(e) =>
                      setUserInput({
                        ...userInput,
                        [e.target.name]: e.target.value,
                      })
                    }
                    value={userInput.password}
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
              </form>
            </SidePanel>
            <SidePanel
              isOpen={showLoginConfirm}
              onClose={() => {
                setShowLoginConfirm(false);
                setLoginUser(null);
              }}
            >
              <p className="cautionTxt">
                Do you want to login as {loginUser?.Name}?
              </p>
              <div className="flexcaution">
                <button
                  className="caution"
                  onClick={() => handleLoginAsUser(loginUser._id)}
                >
                  Yes
                </button>
                <button
                  className="caution"
                  onClick={() => {
                    setShowLoginConfirm(false);
                    setLoginUser(null);
                  }}
                >
                  {" "}
                  No{" "}
                </button>{" "}
              </div>{" "}
            </SidePanel>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserManagement;
