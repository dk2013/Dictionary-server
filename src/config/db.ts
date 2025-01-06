import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process?.env?.MONGO_URI as string);
    console.log("MongoDB connected");
  } catch (e: any) {
    console.error("Could not connect to MongoDB:", e.message);
    process.exit(1);
  }
};

export default connectDB;
