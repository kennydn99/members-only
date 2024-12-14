const express = require("express");
const path = require("node:path");

const app = express();
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello world!");
});

// Sign-up Form route
app.get("/sign-up", (req, res) => res.render("signUp"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
