
import mongoose from "mongoose";

async function connectDB() {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        throw new Error("Database configuration is missing.");
    }

    await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log("MongoDB connected successfully.");
}

export default connectDB;
