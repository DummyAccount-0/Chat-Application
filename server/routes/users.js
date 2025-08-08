import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('username email avatar isOnline lastSeen').limit(20);

    res.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error during user search' });
  }
});

// Get direct message history
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({
      messageType: 'direct',
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ],
      isDeleted: false
    })
    .populate('sender', 'username avatar')
    .populate('recipient', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          messageType: 'direct',
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ],
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', req.user._id] },
              then: '$recipient',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: 1,
            username: 1,
            email: 1,
            avatar: 1,
            isOnline: 1,
            lastSeen: 1
          },
          lastMessage: 1
        }
      }
    ]);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;