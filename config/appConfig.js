import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function mongoConnect(mongoURI) {
  try {
    const con = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log(`Mongodb connected successfully to :-> ${con.connection.host}`);
  } catch (error) {
    return console.log(`Failed to connect Mangodb ${error.message}`);
  }
}

export default {
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/chatappdb",
  mongoConnect,
  port: process.env.POST || parseInt(3000),
};
