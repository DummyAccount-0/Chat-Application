import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Settings } from 'lucide-react';
import { Message, TypingUser } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { UserList } from './UserList';
import { TypingIndicator } from './TypingIndicator';

interface ChatRoomProps {
  socket: any;
  username: string;
  room: string;
  avatar: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ socket, username, room, avatar }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join_room', { username, room, avatar });

    // Listen for messages
    socket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for recent messages
    socket.on('recent_messages', (recentMessages: Message[]) => {
      setMessages(recentMessages);
    });

    // Listen for user events
    socket.on('user_joined', (data: any) => {
      setUsers(data.users);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        room,
        username: 'System',
        message: data.message,
        timestamp: new Date(),
        avatar: ''
      }]);
    });

    socket.on('user_left', (data: any) => {
      setUsers(data.users);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        room,
        username: 'System',
        message: data.message,
        timestamp: new Date(),
        avatar: ''
      }]);
    });

    socket.on('room_users', (roomUsers: string[]) => {
      setUsers(roomUsers);
    });

    // Listen for typing events
    socket.on('user_typing', (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.username !== data.username);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    });

    return () => {
      socket.off('receive_message');
      socket.off('recent_messages');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('room_users');
      socket.off('user_typing');
    };
  }, [socket, username, room, avatar]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send_message', { message: newMessage.trim() });
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('typing_stop');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (socket && value.trim()) {
      socket.emit('typing_start');
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop');
      }, 1000);
    } else if (socket) {
      socket.emit('typing_stop');
    }
  };

  const activeTypingUsers = typingUsers.filter(user => 
    user.isTyping && user.username !== username
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">#{room}</h1>
              <p className="text-sm text-gray-500">{users.length} members</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUsers(!showUsers)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isOwn={message.username === username}
            />
          ))}
          
          {/* Typing Indicator */}
          {activeTypingUsers.length > 0 && (
            <TypingIndicator users={activeTypingUsers.map(u => u.username)} />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder={`Message #${room}`}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* User List Sidebar */}
      {showUsers && (
        <div className="w-64 bg-white border-l border-gray-200">
          <UserList users={users} currentUser={username} />
        </div>
      )}
    </div>
  );
};