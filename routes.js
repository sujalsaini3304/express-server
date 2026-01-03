import express from "express"
import mongoose from "mongoose";
import { User } from "./models.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { verifyToken } from "./authMiddleware.js";
import { connectDB } from "./db.js";

dotenv.config({
  path: ".env",
})

const route = express.Router();


route.get("/", (req, res) => {
  res.json({
    "message": "Server started",
    "status": 200
  })
})


route.post("/create/user", async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, role = "user" } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username: name,
      email_verified: false,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



route.post("/login/user", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user + explicitly include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        user_image: user.user_image,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


route.delete("/delete/user", verifyToken, async (req, res) => {
  try {
    await connectDB();
    const userId = req.user.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User account deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default route;

