# Real-time Chat Application

A modern, real-time chat application built with React, Node.js, Socket.IO, MongoDB Atlas, and RedisCloud.

## Features

- ✅ Real-time messaging with WebSocket connections
- ✅ User authentication and presence tracking
- ✅ Multiple chat rooms with join/leave functionality
- ✅ Typing indicators and online user status
- ✅ Message persistence with MongoDB Atlas
- ✅ Redis-powered real-time features
- ✅ Responsive design with smooth animations
- ✅ Message timestamps and user avatars

## Prerequisites

Before running this application, you need to set up:

1. **MongoDB Atlas Account**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster and database
   - Get your connection string

2. **Redis Cloud Account**
   - Create a free account at [Redis Cloud](https://redis.com/try-free/)
   - Create a new database
   - Get your Redis connection URL

## Setup Instructions

1. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your .env file with:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
   REDIS_URL=rediss://username:password@host:port
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:5173
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Application**
   ```bash
   # Run both server and client concurrently
   npm run dev:all
   
   # Or run separately:
   # Terminal 1: npm run server
   # Terminal 2: npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Socket.IO Client** for real-time communication
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **date-fns** for date formatting

### Backend (Node.js + Express)
- **Express** server with Socket.IO for WebSocket handling
- **MongoDB Atlas** for persistent message and user storage
- **RedisCloud** for real-time features and caching
- **Mongoose** for MongoDB object modeling

### Key Components
- `ChatRoom`: Main chat interface with message display
- `MessageBubble`: Individual message rendering component
- `UserList`: Online users sidebar
- `TypingIndicator`: Shows when users are typing
- `JoinForm`: Username and room selection

## Usage

1. Enter your username and choose a room name
2. Click on popular rooms or create a custom room
3. Start chatting in real-time with other users
4. See typing indicators when others are typing
5. View online users in the sidebar

## Database Schema

### Messages Collection
```javascript
{
  id: String (unique),
  room: String,
  username: String,
  message: String,
  timestamp: Date,
  avatar: String
}
```

### Users Collection
```javascript
{
  username: String (unique),
  avatar: String,
  lastSeen: Date
}
```

## Redis Data Structure

- `room:{roomName}:users` - Set of users in each room
- `room:{roomName}:messages` - Recent messages cache (last 50)
- `user:{username}:rooms` - Set of rooms user has joined

## Development

The application uses ES modules and modern JavaScript features. Key development scripts:

- `npm run dev` - Start Vite development server
- `npm run server` - Start Node.js backend
- `npm run dev:all` - Run both concurrently
- `npm run build` - Build for production

## Production Deployment

1. Set production environment variables
2. Build the React application: `npm run build`
3. Deploy the backend to your preferred hosting service
4. Configure MongoDB Atlas and Redis Cloud for production
5. Update CORS settings for your production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details