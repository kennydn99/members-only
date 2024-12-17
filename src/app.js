const express = require("express");
const path = require("node:path");
const passport = require("passport");
const session = require("express-session");
const indexRoutes = require("../routes/index");
const signUpRoutes = require("../routes/signUp");
const authRoutes = require("../routes/auth");
const messagesRoutes = require("../routes/messages");

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

// Routes
app.use("/", indexRoutes);
app.use("/sign-up", signUpRoutes);
app.use("/auth", authRoutes);
app.use("/messages", messagesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
