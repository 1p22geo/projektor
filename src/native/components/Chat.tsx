import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import Button from './Button';
import { getWebSocketManager } from '@core/api/socket';
import apiClient from '@core/api/apiClient';
import useSWR from 'swr';

interface ChatMessage {
  id?: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface ChatProps {
  teamId: string;
}

const Chat: React.FC<ChatProps> = ({ teamId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsManager = getWebSocketManager();
  
  // Fetch existing messages
  const { data: messages = [], mutate } = useSWR<ChatMessage[]>(
    teamId ? `/teams/${teamId}/chat` : null,
    (url) => apiClient.get(url).then(res => res.data),
    { refreshInterval: 2000 } // Poll every 2 seconds as fallback
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!teamId) return;

    // Try to connect to WebSocket, but don't fail if it doesn't work
    try {
      wsManager.connect(teamId);

      // Listen for new messages
      const unsubscribe = wsManager.onMessage(teamId, (data: ChatMessage) => {
        if (data.message) {
          // Revalidate to get the latest messages
          mutate();
        }
      });

      return () => {
        unsubscribe();
        try {
          wsManager.disconnect(teamId);
        } catch (e) {
          // Ignore disconnect errors
        }
      };
    } catch (e) {
      console.warn('WebSocket connection failed, using polling instead:', e);
    }
  }, [teamId, wsManager, mutate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && teamId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const messageData = {
        user_id: user.id,
        user_name: user.email || user.name || 'Anonymous',
        message: newMessage,
      };

      try {
        // Send to backend API
        await apiClient.post(`/teams/${teamId}/chat`, messageData);
        
        // Try to broadcast via WebSocket, but don't fail if it doesn't work
        try {
          wsManager.send(teamId, messageData);
        } catch (e) {
          console.warn('WebSocket send failed:', e);
        }
        
        setNewMessage('');
        mutate(); // Refresh messages
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }} role="tabpanel">
      <Typography variant="h6" gutterBottom>
        Team Chat
      </Typography>
      <Paper 
        variant="outlined" 
        sx={{ height: 300, overflow: 'auto', p: 2, mb: 2 }}
        data-testid="chat-messages"
      >
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          <List>
            {messages.map((msg, index) => (
              <ListItem key={msg.id || index} disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary={
                    <Box>
                      <Typography 
                        component="span" 
                        variant="subtitle2" 
                        data-testid="message-sender"
                      >
                        {msg.user_name}:
                      </Typography>{' '}
                      {msg.message}
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      data-testid="message-timestamp"
                    >
                      {new Date(msg.created_at).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Paper>
      <Box component="form" sx={{ display: 'flex', gap: 1 }} onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
        <TextField
          name="message"
          placeholder="Type your message..."
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button type="submit" variant="contained">
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
