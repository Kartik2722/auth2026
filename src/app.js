//Importing External moudule
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

const AuthRouter = require("./routes/AuthRouter");
const userRouter = require("./routes/userRouter");


// middlewares
app.use("/uploads", express.static(path.join(process.cwd(),"uploads")));

app.use(express.json());   
app.use(express.urlencoded({ extended: true }));
app.use(cors()); //is se sari orgin allow hojayegi
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app-name.netlify.app'
  ],
  credentials: true
}));
// Middleware for Auth  routes
app.use("/api/v1/auth", AuthRouter);

// middleware for user posts
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts",userRouter);
// app.use("/api/v1/posts")
// for admin
// app.use("api/v1/admin",router)

app.get("/", (req, res) => {
  res.json({
    message: "perfectly working"
  });
});


module.exports = app;
