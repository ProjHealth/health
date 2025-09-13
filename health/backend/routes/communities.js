import express from "express";
import Community from "../models/Community.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Create a new community group
router.post("/create", authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  try {
    const community = new Community({
      name,
      description,
      creator : req.userId,
      members : [req.userId],
    });
    await community.save();
    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all communities
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find().populate("creator", "name email");
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Join a community
router.post("/join/:id", authMiddleware, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });
    if (!community.members.includes(req.userId)) {
      community.members.push(req.userId);
      await community.save();
    }
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
