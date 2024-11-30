import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env["DB.MONGO_URI"];
if (!MONGO_URI) {
  throw new Error("MongoDB URI not found!!");
}

const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Successfully connected to mongo!!");
  } catch (error) {
    console.error("Mongo DB connection error\n", error);
    throw error;
    // process.exit(1);
  }
};

export default connectDb;
