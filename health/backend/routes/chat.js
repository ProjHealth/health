import express from "express";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

const router = express.Router();

// messages: [
//   {
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     text: String,
//     timestamp: Date
//   }
// ]

// Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// 🔹 Initiate Chat
router.post("/initiate/:friendId", authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.params;

    // check both users exist
    const user = await User.findById(req.userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) return res.status(404).json({ message: "User not found" });

    // check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, friendId], $size: 2 },
    });

    if (!chat) {
      chat = new Chat({ participants: [req.userId, friendId], messages: [] });
      await chat.save();
    }

    res.json({ chatId: chat._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "name _id")
      .populate("messages.sender", "name _id");
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // ensure the requester is a participant
    if (!chat.participants.map(p => p._id.toString()).includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(chat);  // send whole chat (participants + messages)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Send Message
router.post("/send/:chatId", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const newMessage = {
      sender: req.userId,
      text,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



/**
 * Send a message to a chat
 * POST /api/chat/:chatId/message
 */
router.post("/:chatId/message", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text is required" });
    }

    // find the chat
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // ensure sender is a participant
    if (!chat.participants.map((p) => p.toString()).includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // create the message
    const newMessage = {
      sender: req.userId,
      text: text.trim(),
      timestamp: new Date(),
    };

    // push to chat
    chat.messages.push(newMessage);
    await chat.save();

    // populate sender details in the response
    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name _id")
      .populate("messages.sender", "name _id");

    res.status(201).json(populatedChat);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
