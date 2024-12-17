const { Router } = require("express");
const pool = require("../db/pool");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT messages.title, messages.text, messages.timestamp, users.full_name
        FROM messages 
        JOIN users ON messages.author_id = users.id
        ORDER BY messages.timestamp DESC`
    );
    const messages = result.rows;

    res.render("index", {
      username: req.user ? req.user.username : null, // Check if user is logged in
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
