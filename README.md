# Full-Stack Chat Application

A modern real-time chat application built with React, Node.js, MongoDB, and Redis.

## Features

- **Real-time Messaging**: WebSocket-powered instant messaging using Socket.io
- **User Authentication**: Secure registration and login with JWT tokens and bcrypt password hashing
- **Direct Messages**: One-on-one conversations between users
- **Team Chat**: Group conversations with team management
- **User Search**: Find and connect with other users
- **Online Status**: Real-time presence tracking with Redis
- **Message Persistence**: All messages stored in MongoDB
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB for data persistence
- Redis for session management and pub/sub messaging
- Socket.io for real-time communication
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- Socket.io client for real-time features

## Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Redis (local installation)
- npm or yarn package manager

## Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configurations:
     ```
     NODE_ENV=development
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/chatapp
     REDIS_URL=redis://localhost:6379
     JWT_SECRET=your-super-secret-jwt-key-change-in-production
     JWT_EXPIRES_IN=7d
     ```

3. **Start MongoDB and Redis services:**
   - Make sure MongoDB is running on `localhost:27017`
   - Make sure Redis is running on `localhost:6379`

4. **Run the application:**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend dev server (port 5173) concurrently.

5. **Access the application:**
   - Open your browser and go to `http://localhost:5173`
   - Create an account or login to start chatting!

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Search Users**: Use the search feature to find other users by username or email
3. **Direct Messages**: Click on a user to start a direct conversation
4. **Create Teams**: Use the "+" button next to Teams to create group chats
5. **Real-time Chat**: Send messages instantly with typing indicators and online status

## Architecture

- **Authentication**: JWT-based authentication with secure password hashing
- **Real-time Communication**: Socket.io handles WebSocket connections
- **Message Broadcasting**: Redis pub/sub ensures messages reach all connected clients
- **Data Persistence**: MongoDB stores users, messages, and team information
- **Session Management**: Redis tracks online users and session data

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/messages/:userId` - Get direct message history
- `GET /api/users/conversations` - Get all user conversations

### Teams
- `POST /api/teams` - Create a team
- `GET /api/teams` - Get user's teams
- `GET /api/teams/:teamId/messages` - Get team messages
- `POST /api/teams/:teamId/members` - Add team member

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token-based authentication
- Protected API routes with authentication middleware
- Input validation and sanitization
- CORS configuration for cross-origin requests

## Performance Optimizations

- Redis caching for session management
- Message pagination for better performance
- Connection pooling for database operations
- Efficient Socket.io room management
- Optimized React components with proper state management

## Development

To extend this application:

1. **Add new features** by creating new React components and API endpoints
2. **Customize styling** by modifying Tailwind CSS classes
3. **Add database models** by creating new Mongoose schemas
4. **Extend Socket.io events** by adding handlers in the socket controller

## Troubleshooting

- **MongoDB Connection**: Ensure MongoDB is running and accessible
- **Redis Connection**: Verify Redis server is running
- **Port Conflicts**: Make sure ports 5000 and 5173 are available
- **Environment Variables**: Double-check all required environment variables are set

## License

This project is open source and available under the MIT License.