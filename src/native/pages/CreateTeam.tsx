import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';

const CreateTeam: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [teamName, setTeamName] = useState('');
  const competitionId = (route.params as any)?.competitionId;

  const handleSubmit = async () => {
    if (!competitionId) {
      console.error('Competition ID is missing');
      return;
    }
    console.log(`Creating team "${teamName}" for competition ${competitionId}`);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Create New Team
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            For Competition: {competitionId}
          </Text>
          <Input
            label="Team Name"
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChangeText={setTeamName}
          />
          <Button onPress={handleSubmit}>Create Team</Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 24,
  },
});

export default CreateTeam;
