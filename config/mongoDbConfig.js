import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env["APP.DB.MONGO_URI"];
const DB_NAME = process.env["APP.DB.NAME"];

if (!MONGO_URI) {
  throw new Error("MongoDB URI not found!!");
}
if (!DB_NAME) {
  throw new Error("MongoDB Name not found!!");
}

const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
    });
    console.log("Successfully connected to mongo!!");
  } catch (error) {
    console.error("Mongo DB connection error\n", error);
    throw error;
    // process.exit(1);
  }
};

export default connectDb;
