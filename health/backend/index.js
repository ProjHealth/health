import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// ❌ REMOVE THIS LINE: import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import communitiesRoutes from './routes/communities.js';
import moodsRoutes from './routes/moods.js';
import moodRoutes from './routes/mood.js';
import emergencyRoutes from './routes/emergency.js';
import friendsRouter from './routes/friends.js';
import chatRouter from './routes/chat.js';
import professionals from './routes/doctor.js';
import expertsRoutes from './routes/experts.js';
import { seedDatabase } from './seedExperts.js';
import chatbotRoutes from './routes/chatbot.js';
import speechRoute from "./routes/speechRoute.js";

dotenv.config();
const app = express();

// ❌ REMOVE THIS LINE: app.use(fileUpload());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  // Check if a file was uploaded by multer
  if (req.body && Object.keys(req.body).length) console.log('Body:', req.body);
  next();
});

// Use specific middleware for specific routes
app.use('/api/auth', express.json(), authRoutes);
app.use('/api/communities', express.json(), communitiesRoutes);
app.use('/api/moods', express.json(), moodsRoutes);
app.use('/api/v1/mood', express.json(), moodRoutes);
app.use('/api/emergency', express.json(), emergencyRoutes);
app.use('/api/contacts', express.json(), emergencyRoutes);
app.use('/api/friends', express.json(), friendsRouter);
app.use('/api/chat', express.json(), chatRouter);
app.use('/api/professionals', express.json(), professionals);
app.use('/api/experts', express.json(), expertsRoutes);

// Apply JSON/urlencoded middleware only to the chatbot route
app.use('/api/chatbot', express.json()); 
app.use('/api/chatbot', express.urlencoded({ extended: true })); 
app.use('/api/chatbot', chatbotRoutes);

// ✅ Correct: The speech route handles its own body parsing with Multer, no global middleware needed.
app.use("/api/speech", speechRoute);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'Server is running', timestamp: new Date().toISOString() }));

// Seed database endpoint (dev only)
app.post('/api/seed-experts', async (req, res) => {
  try {
    const experts = await seedDatabase();
    res.json({ message: 'Database seeded successfully!', count: experts.length });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding database', error: error.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

export default app;