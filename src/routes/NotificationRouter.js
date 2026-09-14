const express = require("express");
const notificationRouter = express.Router();
const {isAuthenticated} = require("../middlewares/authmiddleware");
const { getNotifications ,markAllRead,getUnread } = require("../controllers/NotifiactionController");


notificationRouter.get("/",isAuthenticated,getNotifications);
notificationRouter.patch("/read-all",isAuthenticated,markAllRead);
notificationRouter.get("/unread",isAuthenticated,getUnread);

module.exports = notificationRouter;