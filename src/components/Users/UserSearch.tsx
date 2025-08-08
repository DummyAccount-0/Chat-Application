import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { chatService } from '../../services/chatService';

interface UserSearchProps {
  setActiveChat: (chat: { type: 'direct' | 'team'; id: string; name: string }) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ setActiveChat }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (query.trim().length < 2) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await chatService.searchUsers(query.trim());
      setUsers(response.users);
    } catch (error) {
      console.error('Search error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: any) => {
    setActiveChat({
      type: 'direct',
      id: user._id,
      name: user.username
    });
    navigate(`/dashboard/chat/${user._id}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Users</h1>
          <p className="text-gray-600">Find users by username or email to start a conversation.</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by username or email..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || query.trim().length < 2}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {hasSearched && (
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {user.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.username}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <MessageCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No users found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;