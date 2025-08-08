import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Smile } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import MessageBubble from './MessageBubble';

const ChatArea = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { socket, typingUsers } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (userId) {
      loadMessages();
    }
  }, [userId]);

  useEffect(() => {
    if (socket && userId) {
      socket.on('new_direct_message', handleNewMessage);
      socket.on('message_sent', handleMessageSent);

      return () => {
        socket.off('new_direct_message', handleNewMessage);
        socket.off('message_sent', handleMessageSent);
      };
    }
  }, [socket, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getDirectMessages(userId!);
      setMessages(response.messages);
      
      // Find recipient info from the first message or search
      if (response.messages.length > 0) {
        const firstMessage = response.messages[0];
        const recipientData = firstMessage.sender._id === user?._id 
          ? firstMessage.recipient 
          : firstMessage.sender;
        setRecipient(recipientData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: any) => {
    if (message.sender._id === userId) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleMessageSent = (message: any) => {
    if (message.recipient._id === userId) {
      setMessages(prev => [...prev, message]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !userId) return;

    socket.emit('send_direct_message', {
      recipientId: userId,
      content: newMessage.trim()
    });

    setNewMessage('');
    stopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const handleTyping = () => {
    if (!socket || !userId) return;

    socket.emit('typing_start', { recipientId: userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (socket && userId) {
      socket.emit('typing_stop', { recipientId: userId });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const isTyping = typingUsers.has(userId || '');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-lg font-medium">
              {recipient?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {recipient?.username || 'User'}
            </h2>
            <p className="text-sm text-gray-500">
              {recipient?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.sender._id === user?._id}
          />
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{typingUsers.get(userId || '')} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;