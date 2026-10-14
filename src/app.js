//Importing External moudule
const express = require("express");
const http = require('http');
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const jwt = require('jsonwebtoken');
const path = require("path");
const WebSocket = require("ws");
const {addClient , removeClient} = require("./utils/socketManager");

const AuthRouter = require("./routes/AuthRouter");
const userRouter = require("./routes/userRouter");
const notificationRouter = require("./routes/NotificationRouter");


// middlewares
app.use("/uploads", express.static(path.join(process.cwd(),"uploads")));

app.use(express.json());   
app.use(express.urlencoded({ extended: true }));
app.use(cors()); //is se sari orgin allow hojayegi
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hiveup31.netlify.app/'
  ],
  credentials: true
}));
// Middleware for Auth  routes
app.use("/api/v1/auth", AuthRouter);

// middleware for user posts
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts",userRouter);
app.use("/api/v1/notifications",notificationRouter);
// app.use("/api/v1/posts")
// for admin
// app.use("api/v1/admin",router)

app.get("/", (req, res) => {
  res.json({
    message: "perfectly working"
  });
});

const wss = new WebSocket.Server({ server }); // ws attaches to the same server
wss.on('connection',(ws,req)=>{
  const url  = new URL(req.url,`http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if(!token) return ws.close(4001,'No token');

  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    ws.userId = decoded.id;
    addClient(decoded.id,ws);

    ws.on('close',()=> removeClient(decoded.id,ws));
    ws.on('error',()=> removeClient(decoded.id,ws));
  }catch(err){
    ws.close(4002,'Invalid token');

  }
});


module.exports = server;
