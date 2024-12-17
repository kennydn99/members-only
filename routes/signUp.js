const { Router } = require("express");
const pool = require("../db/pool");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const router = Router();

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

router.get("/", (req, res) => res.render("signUp", { errors: [] }));

// POST sign-up route
router.post("/", validateSignUp, async (req, res) => {
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
    res.redirect("/auth/login");
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

module.exports = router;
