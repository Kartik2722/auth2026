const multer = require("multer");
const path = require("path");
const fs = require("fs");

// uploads folder exit nahi krta toh bna do
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// storage config --> file kha or kis naam se save hogi

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     //console.log(req,file);
//     cb(null, uploadDir);
//   },

//   filename: (req, file, cb) => {
//     // unique filename: timestamp in ms + random number + original extension
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("only image files are allowed"), false);
//   }
// };
// fileFilter: fileFilter,
const upload = multer({
  storage: storage,
});

module.exports = upload;
