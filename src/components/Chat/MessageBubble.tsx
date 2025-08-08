import React from 'react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (date: string) => {
    try {
      return format(new Date(date), 'HH:mm');
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {message.sender?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {message.sender?.username}
            </span>
          </div>
        )}
        
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwn
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm break-words">{message.content}</p>
          <p
            className={`text-xs mt-1 ${
              isOwn ? 'text-indigo-200' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;