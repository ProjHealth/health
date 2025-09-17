import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import communitiesRoutes from "./routes/communities.js";
import moodsRoutes from "./routes/moods.js";
import moodRoutes from './routes/mood.js';
import friendsRouter from './routes/friends.js';
import chatRouter from './routes/chat.js';
import professionals from './routes/doctor.js';


dotenv.config();

const app = express();

// Debug logging
console.log('Environment variables loaded:');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// CORS setup - allow localhost:3000 for development
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/communities", communitiesRoutes);
app.use("/api/moods", moodsRoutes);
app.use('/api/v1/mood', moodRoutes);
app.use('/api/friends', friendsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/professionals',professionals);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
