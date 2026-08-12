const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Comment = require("../models/Comment");
const { json } = require("express");
const imagekit = require("../config/imageKit");
const path = require("path");

// create post controler function
exports.createPost = async (req, res) => {
  try {
    const { PostContent, Location } = req?.body;
    //console.log(req.body);
    //console.log(req.file);

    if (PostContent.trim().length === 0 && !req.file) {
      return res.status(400).json({
        success: false,
        message: " bad request,Post contain atleast text or image",
      });
    }
    const fileExtension = path.extname(req.file.originalname);
    let result = null;
    if (req.file) {
      result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `post_${Date.now()}${fileExtension}`,
        folder: "/postImages",
      });
    }

    // console.log(result);
    // let imageUrl = null;
    // if (req.file) {
    //   imageUrl = `/uploads/${req.file.filename}`;
    // }

    const post = await Post.create({
      userId: req.user._id,
      PostContent: PostContent || null,
      image: result?.url || null,
      imageFileId: result?.fileId || null,
      Location: Location || null,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.log("Post create krte vkt error: ", error);
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error,
    });
  }
};

// getAll post controller function
exports.getAllPosts = async (req, res) => {
  try {
    const Posts = await Post.find().populate("userId");
    //console.log(Posts);
    return res.status(200).json({
      success: true,
      message: "sucessfully posts fetched",
      Posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// handleLike controller function
exports.handleLike = async (req, res) => {
  try {
    const PostId = req.params.id;
    const UserId = req.user._id;

    const post = await Post.findById(PostId).select("likes");
    // //console.log(post);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const isLiked = post.likes.includes(UserId);

    // Atomic operators ka use karke database update kare
    const updateOperation = isLiked
      ? { $pull: { likes: UserId } }
      : { $addToSet: { likes: UserId } };
    const UpdatedPost = await Post.findByIdAndUpdate(PostId, updateOperation, {
      new: true,
      runValidators: true,
    });

    // if (post.likes.includes(req.user._id)) {
    //   post.likes = post.likes.filter((id) => !id.equals(req.user._id));
    // } else {
    //   post.likes.push(req.user._id);
    // }

    // const UpdatedPost = await Post.findByIdAndUpdate(PostId,{likes:post.likes},{new:true,runValidators:true});

    return res.status(200).json({
      success: true,
      message: isLiked ? "Unliked sucesfully" : "Liked successfully",
      UpdatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error.message,
    });
  }
};

// handle post comment contoller function

exports.handlePostComment = async (req, res) => {
  try {
    // //console.log(req.body);

    const UserId = req.user._id;
    const { mycomment } = req.body;
    const PostId = req.params.id;

    if (!UserId || !mycomment || !PostId) {
      return res.status(400).json({
        success: false,
        message: "Bad request , missing fields found",
      });
    }

    const newcomment = await Comment.create({
      UserId,
      comment: mycomment,
      PostId,
    });
    // //console.log(newcomment);
    await Post.findByIdAndUpdate(PostId, { $inc: { commentCount: 1 } });
    return res.status(201).json({
      success: true,
      message: "Comment is added successfully",
      comment: newcomment,
    });
    //console.log(newcomment);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error.message,
    });
  }
};

// controller fuction for the geting comments of a post

exports.handleGetComment = async (req, res) => {
  try {
    const PostId = req.params.id;

    if (!PostId) {
      return res.status(404).json({
        success: false,
        message: "Bad request,post id not found",
      });
    }

    const comments = await Comment.find({ PostId: PostId })
      .select("comment UserId")
      .populate("UserId")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Successfully fetched comments",
      comments: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "server error",
      error: error.message,
    });
  }
};

// controller function for the handling deleting comment

exports.handleDeleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Bad request",
      });
    }

    const { PostId } = await Comment.findById(commentId).select("PostId");
    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(PostId, {
      $inc: { commentCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: "comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error.message,
    });
  }
};

// controller function for fetching users own posts

exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        error: "user id not found",
      });
    }

    const userPosts = await Post.find({ userId: userId }).populate("userId");
    //console.log(userPosts);
    return res.status(200).json({
      success: true,
      message: "Users Posts successfully fetched",
      Posts: userPosts ? userPosts : [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error.message,
    });
  }
};

// controller function for handling deleting post

exports.handleDeletePost = async (req, res) => {
  try {
    const PostId = req.params.id;
    if (!PostId) {
      return res.status(404).json({
        success: false,
        message: "Bad request",
      });
    }
    const Post1 = await Post.findById(PostId);
    if(!Post1){
      return res.status(404).json({
        message:"Post not found"
      })
    }

      // Ownership check
    if (Post1.userId.toString() !== (req.user._id).toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await imagekit.deleteFile(Post1.imageFileId);

    const deletedPost = await Post.findByIdAndDelete(PostId);

    // comment deleting
    await Comment.deleteMany({ PostId: PostId });


    return res.status(200).json({
      success: true,
      message: "Post Successfully deleted",
      deletedPost: deletedPost,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error,
    });
  }
};

// Update Post api
exports.UpdatePost = async (req, res) => {
  try {
    let imageUrl = null;
    const PostId = req.params.id;
    const { PostContent, Location } = req?.body;

    const post = await Post.findById(PostId).select("image");
    if (!req.file) {
      imageUrl = post.image !== null ? post.image : null;
    }
    //console.log(req.file);
    if (!PostId) {
      return res.status(404).json({
        success: false,
        message: "Bad Request,Missing field",
      });
    }

    if (PostContent.length === 0 && !req.file) {
      return res.status(404).json({
        success: false,
        message: "Bad Request,Image or text atleast one required",
      });
    }

    // if (req.file) {
    //   imageUrl = `/uploads/${req.file.filename}`;
    // }
  
    let result = null;
    if (req.file) {
        const fileExtension = path.extname(req.file.originalname);
      result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `post_${Date.now()}${fileExtension}`,
        folder: "/postImages",
      });
    }

    const UpdatedPost = await Post.findByIdAndUpdate(
      PostId,
      {
        $set: {
          PostContent: PostContent || null,
          image: result?.url || null,
          imageFileId:result?.fileId || null,
          Location: Location || null,
        },
      },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Post successfully updated",
      UpdatedPost: UpdatedPost,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error,
    });
  }
};

// controller function for get post by id
exports.getPost = async (req, res) => {
  //console.log("hii");
  try {
    const PostId = req.params.id;
    if (!PostId) {
      return res.status(404).json({
        success: false,
        message: "Bad request",
      });
    }
    const post = await Post.findById(PostId);
    // //console.log(post);
    return res.status(200).json({
      success: true,
      message: "Post Fetched successfully",
      Post: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error,
    });
  }
};
