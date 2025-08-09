import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { JoinForm } from './components/JoinForm';
import { ChatRoom } from './components/ChatRoom';

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const socket = useSocket();

  useEffect(() => {
    // Generate a simple avatar color based on username
    if (username) {
      const colors = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
      const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      setAvatar(colors[hash % colors.length]);
    }
  }, [username]);

  const handleJoin = (newUsername: string, newRoom: string) => {
    setUsername(newUsername);
    setRoom(newRoom);
    setIsJoined(true);
  };

  const handleLeave = () => {
    setIsJoined(false);
    setUsername('');
    setRoom('');
    if (socket) {
      socket.disconnect();
    }
  };

  if (!isJoined) {
    return <JoinForm onJoin={handleJoin} />;
  }

  return (
    <div className="h-screen overflow-hidden">
      <ChatRoom 
        socket={socket} 
        username={username} 
        room={room} 
        avatar={avatar}
      />
    </div>
  );
}

export default App;