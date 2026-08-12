const express = require("express");
const { isAuthenticated } = require("../middlewares/authmiddleware");
const {
  createPost,
  getAllPosts,
  handleLike,
  handlePostComment,
  handleGetComment,
  handleDeleteComment,
  getMyPosts,
  handleDeletePost,
  UpdatePost,
  getPost
} = require("../controllers/userController");
// Router object
const userRouter = express.Router();
// const router = express.Router();
const upload = require("../config/multerConfig");

userRouter.post("/posts", upload.single("image"), isAuthenticated, createPost);
userRouter.get("/posts", isAuthenticated, getAllPosts);
userRouter.delete("/posts/:id", isAuthenticated, handleDeletePost);
userRouter.get("/posts/mine", isAuthenticated, getMyPosts);
userRouter.put("/posts/:id", isAuthenticated, upload.single("image"),UpdatePost);
userRouter.get("/posts/:id",  isAuthenticated,getPost);


userRouter.post("/:id/like", isAuthenticated, handleLike);
userRouter.post("/:id/comment", isAuthenticated, handlePostComment);
userRouter.get("/:id/comment", isAuthenticated, handleGetComment);
userRouter.delete("/:id/comment", isAuthenticated, handleDeleteComment);


// admin only route

// router.get("/posts",isAuthenticated,isAdmin,getAllUsers);

module.exports = userRouter;
