const Contact = require("../model/messages");

exports.ContactUs = async (req, res) => {
  try {
    console.log("Received body:", req.body); // debug
    const newMessage = new Contact(req.body);
    await newMessage.save();
    res
      .status(201)
      .json({ success: true, message: "Message saved successfully" });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
