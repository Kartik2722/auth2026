require("dotenv").config();
const express = require("express");

const connectDB = require("./src/config/db.js");
const app = require("./src/app.js");

const PORT = process.env.PORT || 3000;

// call connectDB that return a promise
connectDB()
  .then((conn) => {
    console.log("Database verification sucessfull: ",conn.connection.host, " starting server");
    app.listen(PORT, () => {
      console.log(`server is running on the port ${PORT}`);
    });
  })
  .catch((error) => {
    //console.log("Database connection failed! Server not started.");
    //console.log(error.message);
    process.exit(1);
  });
