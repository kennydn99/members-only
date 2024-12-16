const { Router } = require("express");
const passport = require("passport");
const router = Router();

router.get("/login", (req, res) => res.render("login", { error: [] }));

// Post login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/loginSuccess",
    failureRedirect: "/loginFail",
  })
);

module.exports = router;
