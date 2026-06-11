import mongoose from "mongoose";

const URI = process.env.MONGO_URI;
const env = process.env.NODE_ENV;

if (!URI) {
  throw new Error("MONGO_URI is not defined");
}

export const ConnectDB = async () => {
  try {
    await mongoose.connect(URI);
    if (env === "development") {
      console.log("Database connected");
    }
  } catch (error) {
    if (env === "development") {
      console.error("Failed to connect to database:", error);
    }
  }
};
