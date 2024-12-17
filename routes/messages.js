const { Router } = require("express");
const pool = require("../db/pool");
const ensureAuthenticated = require("../middleware/auth"); // Protect route
const router = Router();

// Route for creating new Message
router.get("/new", ensureAuthenticated, (req, res) => {
  res.render("newMessage");
});

// Handle new message submit
router.post("/new", ensureAuthenticated, async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    res.render("newMessage", { error: "All fields required." });
  }

  try {
    const date = new Date();
    const author_id = req.user.id;
    await pool.query(
      "INSERT INTO messages (title, text, author_id, timestamp) VALUES ($1, $2, $3, $4)",
      [title, message, author_id, date]
    );
    res.redirect("/"); // Redirect to the home page after submission
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
