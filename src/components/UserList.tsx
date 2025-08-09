import React from 'react';
import { User, Crown } from 'lucide-react';

interface UserListProps {
  users: string[];
  currentUser: string;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUser }) => {
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <User size={18} className="mr-2" />
          Online ({users.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {users.map((username, index) => (
            <div
              key={username}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                username === currentUser 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(username)}`}>
                {username.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <p className={`text-sm font-medium truncate ${
                    username === currentUser ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {username}
                  </p>
                  {username === currentUser && (
                    <span className="text-xs text-blue-600">(you)</span>
                  )}
                  {index === 0 && (
                    <Crown size={14} className="text-yellow-500" title="Room Admin" />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};