import React, { useState } from 'react';
import { MessageCircle, Users, Hash } from 'lucide-react';

interface JoinFormProps {
  onJoin: (username: string, room: string) => void;
}

export const JoinForm: React.FC<JoinFormProps> = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
      onJoin(username.trim(), room.trim());
    }
  };

  const popularRooms = ['general', 'random', 'tech', 'gaming', 'music'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Join ChatApp</h1>
          <p className="text-gray-600">Connect with others in real-time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-2" />
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={20}
              required
            />
          </div>

          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-2" />
              Room Name
            </label>
            <input
              id="room"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={30}
              required
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3">Popular rooms:</p>
            <div className="flex flex-wrap gap-2">
              {popularRooms.map((roomName) => (
                <button
                  key={roomName}
                  type="button"
                  onClick={() => setRoom(roomName)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  #{roomName}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!username.trim() || !room.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Join Chat Room
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By joining, you agree to be respectful and follow community guidelines
          </p>
        </div>
      </div>
    </div>
  );
};