import mongoose from "mongoose";
import seeder from "../seed.js";
const mongoUri = process.env.MONGO_URL || "mongodb://gatewaydb:27017/users";

export async function connect() {
  try {
    console.log("Connecting to MongoDB with Mongoose...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected for DB service");
  } catch (connErr) {
    console.error("❌ Error connecting to MongoDB:", connErr);
  }
}

export async function disconnect() {
  try {
    console.log("Closing connection to MongoDB...");
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  } catch (closeErr) {
    console.error("⚠️ Failed to close connection:", closeErr);
  }
}

export async function connectAndSeed() {
  await connect();
  await seeder();
}
