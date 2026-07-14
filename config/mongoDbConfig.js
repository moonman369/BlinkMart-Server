import mongoose from "mongoose";
import dns from "node:dns";
import dotenv from "dotenv";
dotenv.config();

// mongodb+srv:// URIs need an SRV DNS lookup. Some ISP/router resolvers refuse
// SRV queries (querySrv ECONNREFUSED), so point Node at public resolvers.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGO_URI = process.env["APP_DB_MONGO_URI"];
const DB_NAME = process.env["APP_DB_NAME"];

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
