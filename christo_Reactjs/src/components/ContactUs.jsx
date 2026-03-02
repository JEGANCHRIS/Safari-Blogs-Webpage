import { useState, useEffect } from "react";
import axios from "axios";

export function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    mail: "",
    mobile: "",
    message: "",
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://safari-blogs-webpage-2.onrender.com/api/contactUs",
        formData
      );
      setFormData({ name: "", mail: "", mobile: "", message: "" });
      setMessage({ type: "success", text: "Message sent successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(
        "error submitting form:",
        err.response?.data || err.message
      );
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again",
      });

      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <section className="contactUs" id="Con">
      <div className="container">
        <div className="formContainer">
          <div className="formContent">
            <h2 className="formHeader">Contact Us</h2>
            <form className="messageForm" onSubmit={handleSubmit}>
              <label className="label">Name</label>
              <input
                className="Msginput"
                type="text"
                name="name"
                value={formData.name}
                placeholder="Enter your Name"
                onChange={handleChange}
              />
              <label className="label">Mail</label>
              <input
                className="Msginput"
                type="text"
                name="mail"
                value={formData.mail}
                placeholder="Enter your Mail"
                onChange={handleChange}
              />
              <label className="label">MobileNo</label>
              <input
                className="Msginput"
                type="number"
                name="mobile"
                value={formData.mobile}
                placeholder="Enter your phoneNumber"
                onChange={handleChange}
              />
              <textarea
                className="MsgField"
                value={formData.message}
                name="message"
                id="msgBox"
                placeholder="Enter your Querries"
                onChange={handleChange}
              ></textarea>
              <button className="MsgSubmitBtn">Submit</button>
              {message && (
                <div
                  className={`msg ${
                    message.type === "success" ? "green" : "red"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
