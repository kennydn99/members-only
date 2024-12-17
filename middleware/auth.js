// Middleware function to ensure only logged in users can access the newMessage route
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

module.exports = ensureAuthenticated;
