const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URl);
    //console.log(`Mongodb is connected : ${conn.connection.host}`);
    return conn;
  } catch (error) {
    //console.log(`Error occured while connecting Mongodb : ${error}`)
    throw error;
  }
};

module.exports = connectDB;
