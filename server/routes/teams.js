import express from 'express';
import Team from '../models/Team.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create team
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = new Team({
      name: name.trim(),
      description: description?.trim(),
      owner: req.user._id,
      isPrivate: isPrivate || false,
      members: [{
        user: req.user._id,
        role: 'owner'
      }]
    });

    await team.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'username email avatar')
      .populate('members.user', 'username email avatar isOnline');

    res.status(201).json({ message: 'Team created successfully', team: populatedTeam });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error during team creation' });
  }
});

// Get user's teams
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user._id })
      .populate('owner', 'username email avatar')
      .populate('members.user', 'username email avatar isOnline')
      .sort({ updatedAt: -1 });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team messages
router.get('/:teamId/messages', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const team = await Team.findById(teamId);
    if (!team || !team.members.some(member => member.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied to this team' });
    }

    const messages = await Message.find({
      messageType: 'team',
      team: teamId,
      isDeleted: false
    })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get team messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add team member
router.post('/:teamId/members', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const userMember = team.members.find(member => member.user.toString() === req.user._id.toString());
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    if (team.members.some(member => member.user.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    team.members.push({ user: userId, role: 'member' });
    await team.save();

    await User.findByIdAndUpdate(userId, { $push: { teams: teamId } });

    const updatedTeam = await Team.findById(teamId)
      .populate('members.user', 'username email avatar isOnline');

    res.json({ message: 'Member added successfully', team: updatedTeam });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;