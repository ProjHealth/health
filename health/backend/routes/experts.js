import express from 'express';
import jwt from 'jsonwebtoken';
import { Expert, Following } from '../models/Expert.js';

const router = express.Router();

// --- Auth middleware defined here ---
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const tokenWithoutBearer = token.replace('Bearer ', '');
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET || 'your-jwt-secret');
    req.user = decoded; // add user info to request
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// --- Routes ---

// Get all experts
router.get('/list', auth, async (req, res) => {
  try {
    const experts = await Expert.find({ isActive: true }).select('-posts');
    res.json(experts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get experts user is following
router.get('/following', auth, async (req, res) => {
  try {
    const followingList = await Following.find({ userId: req.user.userId })
      .populate('expertId', 'name title profilePicture specializations verified')
      .exec();

    const experts = followingList.map(f => f.expertId);
    res.json(experts);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow an expert
router.post('/follow/:expertId', auth, async (req, res) => {
  try {
    const { expertId } = req.params;
    const userId = req.user.userId;

    const expert = await Expert.findById(expertId);
    if (!expert) return res.status(404).json({ message: 'Expert not found' });

    const existingFollow = await Following.findOne({ userId, expertId });
    if (existingFollow) return res.status(400).json({ message: 'Already following this expert' });

    const following = new Following({ userId, expertId });
    await following.save();

    await Expert.findByIdAndUpdate(expertId, { $inc: { followersCount: 1 } });

    res.json({ message: 'Successfully followed expert' });
  } catch (error) {
    console.error('Error following expert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow an expert
router.post('/unfollow/:expertId', auth, async (req, res) => {
  try {
    const { expertId } = req.params;
    const userId = req.user.userId;

    const result = await Following.findOneAndDelete({ userId, expertId });
    if (!result) return res.status(400).json({ message: 'Not following this expert' });

    await Expert.findByIdAndUpdate(expertId, { $inc: { followersCount: -1 } });

    res.json({ message: 'Successfully unfollowed expert' });
  } catch (error) {
    console.error('Error unfollowing expert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expert profile with posts
router.get('/:expertId', auth, async (req, res) => {
  try {
    const { expertId } = req.params;
    const expert = await Expert.findById(expertId);

    if (!expert) return res.status(404).json({ message: 'Expert not found' });

    const isFollowing = await Following.findOne({ userId: req.user.userId, expertId });

    res.json({
      ...expert.toObject(),
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Error fetching expert profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts from followed experts (feed)
router.get('/feed/posts', auth, async (req, res) => {
  try {
    const followingList = await Following.find({ userId: req.user.userId });
    const expertIds = followingList.map(f => f.expertId);

    const experts = await Expert.find({ _id: { $in: expertIds } })
      .select('name title profilePicture posts verified');

    const posts = [];
    experts.forEach(expert => {
      expert.posts.forEach(post => {
        posts.push({
          ...post.toObject(),
          expert: {
            _id: expert._id,
            name: expert.name,
            title: expert.title,
            profilePicture: expert.profilePicture,
            verified: expert.verified
          }
        });
      });
    });

    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
