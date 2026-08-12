// importing External modules
const express = require("express");

// importing Local modules || importing controller functions for user auth and user detail
const {
  Signup,
  Login,
  GetMyprofile,
  HandleGoogleLogin,
} = require("../controllers/authController");
const {isAuthenticated} = require("../middlewares/authmiddleware");

// router object
const AuthRouter = express.Router();

// routes for user auth (Login and signup)

AuthRouter.post("/google", HandleGoogleLogin);
AuthRouter.post("/register", Signup);
AuthRouter.post("/Login", Login);

// Protected route for Main Home Page
AuthRouter.get("/me", isAuthenticated, GetMyprofile);

module.exports = AuthRouter;
