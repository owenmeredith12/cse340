const jwt = require("jsonwebtoken");

function checkAccountRole(allowedRoles = []) {
  return function (req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
      req.flash("notice", "You must be logged in to access that page.");
      return res.redirect("/account/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Check if account_type is allowed
      if (!allowedRoles.includes(decoded.account_type)) {
        req.flash("notice", "You do not have permission to view this page.");
        return res.redirect("../account/login");
      }

      // Attach decoded user info to request
      req.account = decoded;
      res.locals.account_type = decoded.account_type;
      res.locals.loggedin = true;
      next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      req.flash("notice", "Please log in again.");
      res.clearCookie("jwt");
      return res.redirect("/account/login");
    }
  };
}

module.exports = checkAccountRole;