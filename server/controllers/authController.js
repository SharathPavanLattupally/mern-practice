
import crypto from "node:crypto";
import { sendEmail } from "../config/email.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Escape user-provided text before inserting it into HTML emails.
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-30 characters and contain only letters, numbers, and underscores.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters.",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered.",
      });
    }

    console.error("Registration failed.");

    return res.status(500).json({
      success: false,
      message: "Registration failed due to a server error.",
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256",
      }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    user.refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    user.refreshTokenExpires = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      expiresIn: "15m",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed.");

    return res.status(500).json({
      success: false,
      message: "Login failed due to a server error.",
    });
  }
};

// GET LOGGED-IN USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile.",
    });
  }
};

// UPDATE LOGGED-IN USER PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const updates = {};

    if (username === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a username or email to update.",
      });
    }

    if (username !== undefined) {
      if (typeof username !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid username.",
        });
      }

      const normalizedUsername = username.trim();

      if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
        return res.status(400).json({
          success: false,
          message: "Username must be 3-30 characters and contain only letters, numbers, and underscores.",
        });
      }

      updates.username = normalizedUsername;
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid email address.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }

      updates.email = normalizedEmail;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("username email role createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already in use.",
      });
    }

    console.error("Profile update failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      return res.status(400).json({
        success: false,
        message: "New password must be between 8 and 72 characters.",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    // Revoke existing sessions after password change.
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.refreshTokenHash = null;
    user.refreshTokenExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    const response = {
      success: true,
      message: "If an account exists, a password reset link will be sent.",
    };

    if (!user) {
      return res.status(200).json(response);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset</h2>
          <p>Hello ${escapeHtml(user.username)},</p>
          <p>You requested to reset your password.</p>
          <p>
            <a href="${resetUrl}">Reset Your Password</a>
          </p>
          <p>This link expires in 15 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        `,
      });
    } catch (emailError) {
      user.resetPasswordTokenHash = null;
      user.resetPasswordExpires = null;
      await user.save();

      console.error("Password reset email could not be sent.");

      return res.status(503).json({
        success: false,
        message: "Unable to send password reset email. Please try again.",
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Forgot password operation failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request.",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate reset token without restricting its format.
    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token.",
      });
    }

    // Validate new password.
    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters.",
      });
    }

    // Hash the received reset token.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with a valid, unexpired reset token.
    const user = await User.findOne({
      resetPasswordTokenHash: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordTokenHash +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token.",
      });
    }

    // Hash and save the new password.
    user.password = await bcrypt.hash(newPassword, 12);

    // Invalidate the reset token after successful use.
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;

    // Revoke all existing sessions after password reset.
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.refreshTokenHash = null;
    user.refreshTokenExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Reset password operation failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};


// UPDATE USER ROLE (ADMIN ONLY - protect this route in authRoutes.js)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["admin", "staff", "viewer"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select("username email role createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("User role update failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to update user role.",
    });
  }
};

// LOGOUT USER
export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Revoke all existing access tokens.
      user.tokenVersion = (user.tokenVersion || 0) + 1;

      // Invalidate refresh token.
      user.refreshTokenHash = null;
      user.refreshTokenExpires = null;

      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout operation failed.");

    return res.status(500).json({
      success: false,
      message: "Unable to log out. Please try again.",
    });
  }
};
