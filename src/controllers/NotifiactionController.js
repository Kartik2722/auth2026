const Notifications = require("../models/Notifications")

exports.getNotifications = async (req,res)=>{
  const notifications = await Notifications.find({recipient:req.user._id}).sort({createdAt:-1}).populate('sender','username avatar');
  res.json(notifications);
};

exports.markAllRead = async (req,res)=>{
    await Notifications.updateMany({recipient:req.user._id,isRead:false},{$set:{isRead:true}});
    res.json({success:true});
};

exports.getUnread = async (req,res)=>{
    const notificationsCount = await Notifications.countDocuments({recipient:req.user._id,isRead:false});
    res.json({Count:notificationsCount});
}