import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatArea from '../Chat/ChatArea';
import TeamChat from '../Chat/TeamChat';
import UserSearch from '../Users/UserSearch';

const Dashboard = () => {
  const [activeChat, setActiveChat] = useState<{
    type: 'direct' | 'team';
    id: string;
    name: string;
  } | null>(null);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} />
      
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Welcome to ChatApp
                </h2>
                <p className="text-gray-500">
                  Select a conversation or team to start chatting
                </p>
              </div>
            </div>
          } />
          <Route path="/chat/:userId" element={<ChatArea />} />
          <Route path="/team/:teamId" element={<TeamChat />} />
          <Route path="/search" element={<UserSearch setActiveChat={setActiveChat} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;