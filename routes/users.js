const express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  {
    renderRegister,
    register,
    renderLogin,
    login,
    logout,
  } = require("../controllers/user");
catchAsync = require("../utils/catchAsync");
router
  .route("/register")
  //REGISTER-NEW route
  .get(renderRegister)
  //REGISTER-POST route
  .post(catchAsync(register));

router
  .route("/login")
  //LOGIN-NEW route
  .get(renderLogin)
  //LOGIN-POST route
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    login
  );

//LOGOUT-GET route
router.get("/logout", logout);
module.exports = router;
