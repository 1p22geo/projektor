import React, { useState, useEffect } from 'react';
import apiClient from '@core/api/apiClient';
import { Box, TextField, Paper, Typography, List, ListItem, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@platform/components/Button';

interface ChatProps {
  teamId: string;
}

interface Message {
  _id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

const Chat: React.FC<ChatProps> = ({ teamId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get user role from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [teamId]);

  const loadMessages = async () => {
    try {
      const response = await apiClient.get(`/student/teams/${teamId}/chat`);
      setMessages(response.data.chat || []);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      await apiClient.post(`/student/teams/${teamId}/chat`, { message: newMessage });
      setNewMessage('');
      await loadMessages();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await apiClient.delete(`/headteacher/teams/${teamId}/chat/${messageId}`);
      await loadMessages();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete message');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Chat</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ maxHeight: 400, overflow: 'auto', mb: 2, p: 2 }} data-testid="chat-messages">
        {messages.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          <List>
            {messages.map((msg) => (
              <ListItem key={msg._id} alignItems="flex-start" sx={{ display: 'block' }}>
                <Box>
                  <Typography component="span" variant="body2" fontWeight="bold" data-testid="message-sender">
                    {msg.user_name}
                  </Typography>
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }} data-testid="message-timestamp">
                    {formatTimestamp(msg.created_at)}
                  </Typography>
                </Box>
                <Typography variant="body2" data-testid="message-content" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                  {msg.message}
                </Typography>
                {userRole === 'headteacher' && (
                  <IconButton
                    data-testid={`delete-message-${msg._id}`}
                    onClick={() => handleDeleteMessage(msg._id)}
                    size="small"
                    color="error"
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          name="message"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button type="submit" disabled={!newMessage.trim() || loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
