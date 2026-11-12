
import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
    try {
        // Validate required environment variables.
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not configured.");
        }

        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            throw new Error("JWT_SECRET must contain at least 32 characters.");
        }

        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = (signal) => {
            console.log(`${signal} received. Closing server...`);

            server.close(() => {
                console.log("HTTP server closed.");
                process.exit(0);
            });

            setTimeout(() => process.exit(1), 10000).unref();
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
