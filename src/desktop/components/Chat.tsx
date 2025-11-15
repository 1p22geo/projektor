import React, { useState, useEffect } from 'react';
import { getSocket } from '@core/api/socket';
import { Box, TextField, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import Button from '@platform/components/Button';

interface ChatProps {
  teamId: string;
}

interface Message {
  user: string;
  message: string;
  createdAt: string;
}

const Chat: React.FC<ChatProps> = ({ teamId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_room', { teamId });

    socket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.emit('leave_room', { teamId });
      socket.off('message');
    };
  }, [teamId, socket]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const user = 'CurrentUser';
      socket.emit('new_message', { teamId, user, message: newMessage });
      setNewMessage('');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ maxHeight: 400, overflow: 'auto', mb: 2, p: 2 }}>
        {messages.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={msg.user}
                  secondary={msg.message}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          variant="outlined"
          size="small"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </Box>
    </Box>
  );
};

export default Chat;
