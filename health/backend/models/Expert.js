import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: String,
  category: {
    type: String,
    enum: ['Anxiety', 'Depression', 'Mindfulness', 'Therapy', 'Wellness', 'General'],
    default: 'General'
  },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  profilePicture: { type: String, required: true },
  specializations: [{ type: String, enum: ['Anxiety', 'Depression', 'Mindfulness', 'Therapy', 'Wellness'] }],
  credentials: [String],
  verified: { type: Boolean, default: false },
  followersCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  posts: [postSchema],
  createdAt: { type: Date, default: Date.now }
});

const followingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
  followedAt: { type: Date, default: Date.now }
});
followingSchema.index({ userId: 1, expertId: 1 }, { unique: true });

export const Expert = mongoose.model('Expert', expertSchema);
export const Following = mongoose.model('Following', followingSchema);
