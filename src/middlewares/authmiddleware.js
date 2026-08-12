const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

// Middleware 1:Authentication
const isAuthenticated = async (req, res, next) => {
  try {
    // step 1:header se token nikalo
    // Format: "Authorization: Bearer <token>"
    // //console.log(req);
    // //console.log(req.headers);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(400)
        .json({ message: "No token , authorization denied" });
    }

    const token = authHeader.split(" ")[1]; //bearer hta k sirf token nikalna

    // step 2 :  token verify karo secret se
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    // //console.log(decodedData);

    // step 3: user ko Database me find krna (extra security check)
    // esa ho skta hai ki token valid ho but user db se delete ho chuka ho
    const currUser = await User.findById(decodedData.id);

    // agar token sahi hai but user exist nahi krta (account deleted hai mtlb)
    if (!currUser) {
      return res
        .status(401)
        .json({ success: false, message: "This account is not exist" });
    }

    currUser.password = undefined;
    // lastly
    // //console.log(currUser);
    req.user = {
      _id: currUser._id,
      username: currUser.username,
      email: currUser.email,
      avatar: currUser.avatar,
      // role:currUser.role
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        mesage: "Token expired",
      });
    }

    if (error.name === "JsonWebToken") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // koi aur unknown error (server issue)

    //console.log("Auth middleware error: ",error);

    return res.status(500).json({
      success: false,
      message: "Authentication server error",
    });
  }
};

// middleware 2:Authorization (role check)

// const isAdmin = (req,res,next)=>{
//   if(req.user.role !== "admin"){
//     return res.status(403).json({
//       message:"Acess denied.Admins Only."
//     });
//   }
//   next();
// }
module.exports = { isAuthenticated };
