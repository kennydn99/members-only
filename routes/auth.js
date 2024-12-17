const { Router } = require("express");
const passport = require("passport");
const router = Router();

router.get("/login", (req, res) => res.render("login", { error: [] }));

// Post login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Handle server errors
    }
    if (!user) {
      return res.render("login", { error: info.message }); // Pass error to the view
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/auth/login");
  });
});
module.exports = router;
