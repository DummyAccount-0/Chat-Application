import Message from '../models/Message.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { redisClient, redisPublisher, redisSubscriber } from '../config/redis.js';
import { socketAuth } from '../middleware/auth.js';

export const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(socketAuth);

  // Redis pub/sub setup
  redisSubscriber.subscribe('chat_messages', (message) => {
    const data = JSON.parse(message);
    io.to(data.room).emit(data.event, data.payload);
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });
    await redisClient.set(`user:${socket.userId}:socketId`, socket.id, { EX: 3600 });

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join user to their team rooms
    const userTeams = await Team.find({ 'members.user': socket.userId });
    userTeams.forEach(team => {
      socket.join(`team:${team._id}`);
    });

    // Handle direct messages
    socket.on('send_direct_message', async (data) => {
      try {
        const { recipientId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        const message = new Message({
          sender: socket.userId,
          recipient: recipientId,
          content: content.trim(),
          messageType: 'direct'
        });

        await message.save();
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('recipient', 'username avatar');

        // Publish to Redis for scalability
        await redisPublisher.publish('chat_messages', JSON.stringify({
          room: `user:${recipientId}`,
          event: 'new_direct_message',
          payload: populatedMessage
        }));

        await redisPublisher.publish('chat_messages', JSON.stringify({
          room: `user:${socket.userId}`,
          event: 'message_sent',
          payload: populatedMessage
        }));

      } catch (error) {
        console.error('Send direct message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle team messages
    socket.on('send_team_message', async (data) => {
      try {
        const { teamId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Verify user is team member
        const team = await Team.findById(teamId);
        if (!team || !team.members.some(member => member.user.toString() === socket.userId)) {
          socket.emit('error', { message: 'Access denied to this team' });
          return;
        }

        const message = new Message({
          sender: socket.userId,
          team: teamId,
          content: content.trim(),
          messageType: 'team'
        });

        await message.save();
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        // Publish to Redis
        await redisPublisher.publish('chat_messages', JSON.stringify({
          room: `team:${teamId}`,
          event: 'new_team_message',
          payload: populatedMessage
        }));

      } catch (error) {
        console.error('Send team message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', ({ recipientId, teamId }) => {
      if (recipientId) {
        socket.to(`user:${recipientId}`).emit('user_typing', {
          userId: socket.userId,
          username: socket.user.username
        });
      } else if (teamId) {
        socket.to(`team:${teamId}`).emit('user_typing_team', {
          userId: socket.userId,
          username: socket.user.username,
          teamId
        });
      }
    });

    socket.on('typing_stop', ({ recipientId, teamId }) => {
      if (recipientId) {
        socket.to(`user:${recipientId}`).emit('user_stopped_typing', {
          userId: socket.userId
        });
      } else if (teamId) {
        socket.to(`team:${teamId}`).emit('user_stopped_typing_team', {
          userId: socket.userId,
          teamId
        });
      }
    });

    // Handle joining new teams
    socket.on('join_team', (teamId) => {
      socket.join(`team:${teamId}`);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        await redisClient.del(`user:${socket.userId}:socketId`);

        // Notify contacts about offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.userId
        });
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
};