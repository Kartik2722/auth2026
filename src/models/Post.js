const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    PostContent: {
      type: String,
    },
    image: {
      type: String,
    },
    imageFileId:{
      type:String
    },

    Location: {
      type: String,
    },

    likes:[{
      type:Schema.Types.ObjectId,
      ref:"User"
    }],
    commentCount:{
      type:Number,
      default:0
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", PostSchema);
