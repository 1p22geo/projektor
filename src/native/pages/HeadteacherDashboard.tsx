import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button as PaperButton, TextInput, List, IconButton, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import apiClient from '@core/api/apiClient';

const HeadteacherDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const [tokenCount, setTokenCount] = useState('1');
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleGenerate = async () => {
    try {
      const response = await apiClient.post('/headteacher/tokens', {
        count: parseInt(tokenCount)
      });
      
      setGeneratedTokens(response.data.tokens);
      setSnackbarMessage('Tokens generated successfully');
      setSnackbarVisible(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to generate tokens');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Dashboard</Title>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Generate Tokens</Title>
          <TextInput
            label="Number of Tokens"
            value={tokenCount}
            onChangeText={setTokenCount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <PaperButton mode="contained" onPress={handleGenerate} style={styles.button}>
            Generate
          </PaperButton>
          
          {generatedTokens.length > 0 && (
            <View style={styles.tokenList}>
              <Paragraph style={styles.subtitle}>Generated Tokens:</Paragraph>
              {generatedTokens.map((token, index) => (
                <List.Item
                  key={index}
                  title={token}
                  titleStyle={styles.tokenText}
                />
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Competitions</Title>
          <Paragraph>Create and manage competitions for your school.</Paragraph>
        </Card.Content>
        <Card.Actions>
          <PaperButton onPress={() => navigation.navigate('CompetitionManagement')}>
            Manage Competitions
          </PaperButton>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Team Moderation</Title>
          <Paragraph>Monitor teams, view chats, and manage members.</Paragraph>
        </Card.Content>
        <Card.Actions>
          <PaperButton onPress={() => navigation.navigate('Moderation')}>
            View Teams
          </PaperButton>
        </Card.Actions>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 8,
  },
  tokenList: {
    marginTop: 16,
  },
  subtitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default HeadteacherDashboard;
