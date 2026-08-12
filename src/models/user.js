const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role:{
      type:String,
      enum:["user","admin"],
      default:"user"
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
