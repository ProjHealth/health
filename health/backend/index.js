import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fileUpload from "express-fileupload";
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

app.use(fileUpload());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length) console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/moods', moodsRoutes);
app.use('/api/v1/mood', moodRoutes);
app.use('/api/chatbot', chatbotRoutes); // Gemini AI chat route
app.use('/api/emergency', emergencyRoutes);
app.use('/api/contacts', emergencyRoutes);
app.use('/api/friends', friendsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/professionals', professionals);
app.use('/api/experts', expertsRoutes);
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
