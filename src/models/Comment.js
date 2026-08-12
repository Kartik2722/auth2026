const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const CommentSchema = new  mongoose.Schema({
  PostId:{
    type:Schema.Types.ObjectId,
    ref:'Post'
  },
  UserId:{
    type:Schema.Types.ObjectId,
    ref:'User'
  },
  comment:{
    type:'String'
  }
},{timestamps:true});


module.exports = mongoose.model('Comment',CommentSchema);