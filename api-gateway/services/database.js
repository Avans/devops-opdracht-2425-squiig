import mongoose from "mongoose";
import seeder from "../seed.js";
const mongoUri = process.env.MONGO_URL || "mongodb://localhost:27017/users";

async function ensureConnected() {
  if (mongoose.connection.readyState === 1) return; // Connected
  if (mongoose.connection.readyState === 2) { // Connecting
    // Wait until it's connected
    try {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      });
      return; // Connected
    } catch (err) {
      console.error('Failed to connect to database:', err);
    }
  }
  // Disconnected or disconnecting, so reconnect
  return await connect();
}


async function connect() {
  try {
    console.log("Connecting to MongoDB with Mongoose...");
    const m = await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected for DB service");
    return m;
  } catch (connErr) {
    console.error("❌ Error connecting to MongoDB:", connErr);
  }
}

async function disconnect() {
  try {
    console.log("Closing connection to MongoDB...");
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  } catch (closeErr) {
    console.error("⚠️ Failed to close connection:", closeErr);
  }
}

async function connectAndSeed() {
  await ensureConnected();
  await seeder();
}

export default {
  ensureConnected,
  connect,
  disconnect,
  connectAndSeed,
};
