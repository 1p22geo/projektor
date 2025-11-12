import React, { useState, useEffect } from 'react';
import { getSocket } from '@core/api/socket';
import { View, Text, TextInput, Button as RNButton, FlatList, StyleSheet } from 'react-native';

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
      const user = 'CurrentUser'; // Replace with actual user from auth context
      socket.emit('new_message', { teamId, user, message: newMessage });
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageBubble}>
      <Text style={styles.messageUser}>{item.user}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
        />
        <RNButton title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    flex: 1,
  },
  messageBubble: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageUser: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    minHeight: 40,
  },
});

export default Chat;
