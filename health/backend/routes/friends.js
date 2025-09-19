import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Friendship from "../models/Friendship.js";

const router = express.Router();

// Middleware to verify JWT - FIXED to match chat.js
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId; // FIXED: Now checks both properties
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

router.get("/recommended", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("friends", "_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendIds = (user.friends || []).map(f => f._id.toString());

    const sentRequests = await Friendship.find({ requester: req.userId }).select("recipient");
    const receivedRequests = await Friendship.find({ recipient: req.userId }).select("requester");

    const excludedIds = [
      req.userId.toString(),
      ...friendIds,
      ...sentRequests.map(r => r.recipient.toString()),
      ...receivedRequests.map(r => r.requester.toString())
    ];

    const recommended = await User.find({ _id: { $nin: excludedIds } }).select("name email");
    res.json(recommended);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Send Friend Request
// POST /request/:id
router.post("/request/:id", authMiddleware, async (req, res) => {
  const recipientId = req.params.id;
  if (recipientId === req.userId) return res.status(400).json({ message: "Cannot add yourself" });

  const existing = await Friendship.findOne({
    $or: [
      { requester: req.userId, recipient: recipientId },
      { requester: recipientId, recipient: req.userId }
    ]
  });

  if (existing) return res.status(400).json({ message: "Request already exists" });

  const request = new Friendship({ requester: req.userId, recipient: recipientId });
  await request.save();
  res.status(201).json(request);
});

// 🔹 Get Incoming Friend Requests
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const requests = await Friendship.find({ recipient: req.userId, status: "pending" })
      .populate("requester", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Accept / Decline Friend Request
router.post("/respond/:id", authMiddleware, async (req, res) => {
  const { action } = req.body; // "accept" or "decline"
  const request = await Friendship.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });
  if (request.recipient.toString() !== req.userId) return res.status(403).json({ message: "Not authorized" });

  if (action === "accept") {
    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(req.userId, { $push: { friends: request.requester } });
    await User.findByIdAndUpdate(request.requester, { $push: { friends: request.recipient } });

    res.json({ message: "Friend request accepted" });
  } else {
    request.status = "declined";
    await request.save();
    res.json({ message: "Friend request declined" });
  }
});

// 🔹 Get Friends List
router.get("/list", authMiddleware, async (req, res) => {
  try {
    console.log("Friends list endpoint hit, userId:", req.userId); // Add debugging
    
    const user = await User.findById(req.userId).populate("friends", "name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = user.friends || [];
    console.log("Friends found:", friends.length); // Add debugging
    res.json(friends);
  } catch (err) {
    console.error("Error fetching friends list:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select("name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 🔹 Get Sent Friend Requests
router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const sentRequests = await Friendship.find({ requester: req.userId, status: "pending" })
      .populate("recipient", "name email");
    res.json(sentRequests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;