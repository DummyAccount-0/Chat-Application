import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Search, Plus, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import CreateTeamModal from '../Teams/CreateTeamModal';

interface SidebarProps {
  activeChat: { type: 'direct' | 'team'; id: string; name: string } | null;
  setActiveChat: (chat: { type: 'direct' | 'team'; id: string; name: string } | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeChat, setActiveChat }) => {
  const [conversations, setConversations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [conversationsData, teamsData] = await Promise.all([
        chatService.getConversations(),
        chatService.getUserTeams()
      ]);
      setConversations(conversationsData.conversations);
      setTeams(teamsData.teams);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDirectMessage = (conversation: any) => {
    setActiveChat({
      type: 'direct',
      id: conversation.user._id,
      name: conversation.user.username
    });
    navigate(`/dashboard/chat/${conversation.user._id}`);
  };

  const handleTeamChat = (team: any) => {
    setActiveChat({
      type: 'team',
      id: team._id,
      name: team.name
    });
    navigate(`/dashboard/team/${team._id}`);
  };

  const handleSearch = () => {
    navigate('/dashboard/search');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">ChatApp</h1>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
          </div>
        </div>

        {/* Search Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleSearch}
            className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="h-5 w-5" />
            <span>Search users...</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Direct Messages */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Direct Messages
            </h2>
            <div className="space-y-1">
              {conversations.map((conversation: any) => (
                <button
                  key={conversation.user._id}
                  onClick={() => handleDirectMessage(conversation)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    activeChat?.type === 'direct' && activeChat?.id === conversation.user._id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="relative">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {conversation.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {conversation.user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.lastMessage?.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Teams
              </h2>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Create Team"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {teams.map((team: any) => (
                <button
                  key={team._id}
                  onClick={() => handleTeamChat(team)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    activeChat?.type === 'team' && activeChat?.id === team._id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{team.name}</p>
                    <p className="text-xs text-gray-500">
                      {team.members.length} members
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCreateTeam && (
        <CreateTeamModal
          onClose={() => setShowCreateTeam(false)}
          onTeamCreated={loadData}
        />
      )}
    </>
  );
};

export default Sidebar;