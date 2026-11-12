
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        const user = await User.findById(decoded.id).select(
            "_id role tokenVersion"
        );

        if (
            !user ||
            (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)
        ) {
            return res.status(401).json({
                success: false,
                message: "Session is invalid or has been revoked. Please log in again.",
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
        };

        return next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token.",
            });
        }

        // Do not expose internal database or server errors.
        console.error("Authentication middleware failed.");

        return res.status(500).json({
            success: false,
            message: "Authentication service temporarily unavailable.",
        });
    }
};
