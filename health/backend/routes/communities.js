import express from "express";
import Community from "../models/Community.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const router = express.Router();

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  console.log("Auth middleware - Headers:", req.headers.authorization);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.userId = decoded._id || decoded.userId || decoded.id;
    if (!req.userId) {
      console.log("No userId in token");
      return res.status(401).json({ message: "Invalid token" });
    }
    console.log("Auth successful, userId:", req.userId);
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
}

// Create a new community group
router.post("/create", authMiddleware, async (req, res) => {
  console.log("POST /create - userId:", req.userId);
  const { name, description } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required" });
  }

  try {
    const community = new Community({
      name,
      description,
      creator : req.userId,
      members : [req.userId],
    });
    
    await community.save();
    console.log("Community created:", community._id);
    res.status(201).json(community);
  } catch (err) {
    console.error("Error in /create:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all communities
router.get("/", async (req, res) => {
  console.log("GET / - Fetching all communities");
  try {
    const communities = await Community.find().populate("creator", "name email");
    console.log("Found communities:", communities.length);
    res.json(communities);
  } catch (err) {
    console.error("Error in GET /communities:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Join a community - THIS IS THE ROUTE THAT'S FAILING
router.post("/join/:id", authMiddleware, async (req, res) => {
  console.log("POST /join/:id - Community ID:", req.params.id, "User ID:", req.userId);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("Invalid community ID:", req.params.id);
      return res.status(400).json({ message: "Invalid community ID" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      console.log("Community not found:", req.params.id);
      return res.status(404).json({ message: "Community not found" });
    }

    console.log("Community found:", community.name);
    console.log("Current members:", community.members);

    // Check if user is already a member
    const isAlreadyMember = community.members.some(
      memberId => memberId.toString() === req.userId.toString()
    );

    if (isAlreadyMember) {
      console.log("User already a member");
      return res.status(200).json({ message: "Already a member", community });
    }

    // Add user to community
    community.members.push(req.userId);
    await community.save();
    
    console.log("User added to community successfully");

    // Return the updated community
    const updatedCommunity = await Community.findById(req.params.id)
      .populate("creator", "name email");
    
    res.json({ message: "Successfully joined community", community: updatedCommunity });
  } catch (err) {
    console.error("Error in /join:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/leave/:id", authMiddleware, async (req, res) => {
  console.log("POST /leave/:id - Community ID:", req.params.id, "User ID:", req.userId);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid community ID" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }


    if (community.members.length === 1 && community.members[0].toString() === req.userId.toString()) {
      // If they are also the creator, tell them to delete the group instead
      if (community.creator.toString() === req.userId.toString()) {
        return res.status(400).json({ message: "You are the last member and creator. Please delete the group instead of leaving." });
      }
      // If they are the last member but not the creator, this could be an edge case,
      // but for now we can prevent leaving to avoid an empty group.
      return res.status(400).json({ message: "You cannot leave as you are the last member." });
    }
    // **NEW LOGIC ENDS HERE**

    // Original logic to remove user from members array
    community.members = community.members.filter(
      (memberId) => memberId.toString() !== req.userId.toString()
    );
    await community.save();

    console.log("User removed from community successfully");
    res.json({ message: "Left group successfully" });
  } catch (err) {
    console.error("Error in /leave:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a community (only creator can delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  console.log("DELETE /:id - Community ID:", req.params.id, "User ID:", req.userId);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid community ID" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is the creator
    if (community.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Only the creator can delete this community" });
    }

    // Delete all messages in this community first
    await Message.deleteMany({ community: req.params.id });
    
    // Delete the community
    await Community.findByIdAndDelete(req.params.id);

    console.log("Community deleted successfully");
    res.json({ message: "Community deleted successfully" });
  } catch (err) {
    console.error("Error in /delete:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get a single community by ID
router.get("/:id", authMiddleware, async (req, res) => {
  console.log("GET /:id - Community ID:", req.params.id);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid community ID" });
    }

    const community = await Community.findById(req.params.id)
      .populate("creator", "name email");
    
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json(community);
  } catch (err) {
    console.error("Error in GET /:id:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get messages for a community
router.get("/:id/messages", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid community ID" });
    }

    const messages = await Message.find({ community: req.params.id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error("Error in GET /:id/messages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Post a message to a community
router.post(
  "/:id/messages", 
  authMiddleware, 
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const { content, anonymous } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Check if community exists and user is a member
      const community = await Community.findById(req.params.id);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const isMember = community.members.some(
        memberId => memberId.toString() === req.userId.toString()
      );
      
      if (!isMember) {
        return res.status(403).json({ message: "You must be a member to post messages" });
      }

      const message = new Message({
        community: req.params.id,
        sender: req.userId,
        content: content.trim(),
        anonymous: !!anonymous,
        createdAt: new Date(),
      });

      await message.save();
      const populated = await message.populate("sender", "name email");
      res.status(201).json(populated);
    } catch (err) {
      console.error("Error in POST /:id/messages:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Debug route to list all available routes
router.get("/debug/routes", (req, res) => {
  res.json({
    message: "Available routes",
    routes: [
      "GET /api/communities/",
      "POST /api/communities/create",
      "POST /api/communities/join/:id",
      "POST /api/communities/leave/:id", 
      "DELETE /api/communities/:id",
      "GET /api/communities/:id",
      "GET /api/communities/:id/messages",
      "POST /api/communities/:id/messages"
    ]
  });
});

export default router;
