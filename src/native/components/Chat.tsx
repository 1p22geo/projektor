import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { getSocket } from '@core/api/socket';
import Button from './Button';

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
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <Text style={styles.emptyText}>
            No messages yet. Start the conversation!
          </Text>
        ) : (
          messages.map((msg, index) => (
            <Card key={index} style={styles.messageCard}>
              <Card.Content>
                <Text variant="labelLarge">{msg.user}</Text>
                <Text variant="bodyMedium">{msg.message}</Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button onPress={handleSendMessage}>Send</Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  messagesContainer: {
    maxHeight: 400,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 32,
  },
  messageCard: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fff',
  },
});

export default Chat;
