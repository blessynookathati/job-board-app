import mongoose from "mongoose";
import { setMongoConnected } from "../services/dataStore.js";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jobconnect";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // fail fast if not running locally
    });
    setMongoConnected(true);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    setMongoConnected(false);
    console.log(`ℹ️ MongoDB not detected (${err.message}).`);
    console.log(`🚀 JobConnect running in High-Fidelity In-Memory Store mode with full CRUD & demo data.`);
    return false;
  }
};
