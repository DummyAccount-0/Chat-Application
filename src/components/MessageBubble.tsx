import React from 'react';
import { format } from 'date-fns';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const isSystem = message.username === 'System';
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          {message.message}
        </div>
      </div>
    );
  }

  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3 ${getAvatarColor(message.username)}`}>
            {message.username.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Message Content */}
        <div className={`px-4 py-2 rounded-lg shadow-sm ${
          isOwn 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-white text-gray-800 rounded-bl-none'
        }`}>
          {!isOwn && (
            <p className="text-xs font-semibold text-gray-600 mb-1">
              {message.username}
            </p>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {format(new Date(message.timestamp), 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
};