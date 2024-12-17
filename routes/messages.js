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

// Delete message route ( for admins)
router.post("/delete/:id", ensureAuthenticated, async (req, res) => {
  const messageId = req.params.id;

  try {
    // check if admin
    if (!req.user.member_status) {
      return res.status(403).send("Unauthorized: Admin access only");
    }

    // Delete message from db
    await pool.query("DELETE FROM messages WHERE id = $1", [messageId]);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
