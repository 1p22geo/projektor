import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { getSocket } from '@core/api/socket'; // Assuming getSocket is implemented

interface ChatMessage {
  user: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  teamId: string;
}

const Chat: React.FC<ChatProps> = ({ teamId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = getSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!teamId) return;

    socket.emit('join_room', { teamId });

    socket.on('message', (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.emit('leave_room', { teamId });
      socket.off('message');
    };
  }, [teamId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && teamId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}'); // Assuming user is in localStorage
      socket.emit('new_message', { teamId, user: user.name || 'Anonymous', message: newMessage, timestamp: new Date().toISOString() });
      setNewMessage('');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Team Chat
      </Typography>
      <Paper variant="outlined" sx={{ height: 300, overflow: 'auto', p: 2, mb: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText primary={`${msg.user}: ${msg.message}`} secondary={new Date(msg.timestamp).toLocaleString()} />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Type your message..."
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button variant="contained" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
