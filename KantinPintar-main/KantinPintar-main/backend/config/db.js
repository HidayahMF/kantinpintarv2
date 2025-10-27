import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); 
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("⏳ Retrying to connect in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};
