const express = require("express");
const path = require("node:path");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const pool = require("../db/pool");
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("../routes/auth");

const app = express();

// Middleware for url encoded data
app.use(express.urlencoded({ extended: false }));

// Set up view engine
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Session middleware
app.use(
  session({
    secret: "cats",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.session());
require("../config/passport")(passport);

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
  res.render("index", { username: req.user ? req.user.username : null });
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

    const result = await pool.query(query, values);
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

app.use("/auth", authRoutes);

// Middleware function to ensure only logged in users can access the newMessage route
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

// Route for creating new Message
app.get("/newMessage", ensureAuthenticated, (req, res) => {
  res.render("newMessage");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
