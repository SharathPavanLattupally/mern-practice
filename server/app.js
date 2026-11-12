
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");

// CORS configuration.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security response headers.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Request body limits.
app.use(express.json({ limit: "20kb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: "20kb",
  })
);

app.use(cookieParser());

// CSRF protection using Origin validation.
app.use((req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.get("Origin");
  const hasRefreshCookie = Boolean(req.cookies?.refreshToken);

  // Reject state-changing cookie requests without an Origin header.
  if (!origin) {
    if (hasRefreshCookie) {
      return res.status(403).json({
        success: false,
        message: "Request origin is required.",
      });
    }

    return next();
  }

  // Reject requests from untrusted origins.
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  next();
});

// Health check.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Management System API is running",
  });
});

// API routes.
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handlers must remain last.
app.use(notFound);
app.use(errorHandler);

export default app;
