const express = require("express");
const path = require("node:path");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const db = require("../db/db");

const app = express();

// Middleware for url encoded data
app.use(express.urlencoded({ extended: true }));

// Set up view engine
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Validate and sanitze form
const validateSignUp = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters.")
    .escape(),
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .escape(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
  body("confirmPass")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
  body("secret").optional().escape(),
];

// Routes
app.get("/", (req, res) => {
  res.send("Hello world!");
});
app.get("/sign-up", (req, res) => res.render("signUp", { errors: [] }));
// POST sign-up route
app.post("/sign-up", validateSignUp, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("signUp", { errors: errors.array() });
  }

  const { username, fullName, password, secret } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into db
    const query = `INSERT INTO users (username, full_name, password, member_status)
      VALUES ($1, $2, $3, $4)
      RETURNING id;`;

    const values = [username, fullName, hashedPassword, secret === "admin123"];

    const result = await db.query(query, values);
    res.send("Sign up successful!Your user ID is: " + result.rows[0].id);
  } catch (err) {
    console.error(err);
    // Handle errors (e.g., username already exists)
    if (err.code === "23505") {
      return res.status(400).render("signUp", {
        errors: [{ msg: "Username already exists." }],
      });
    }
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
