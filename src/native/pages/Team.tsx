import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import Button from '@platform/components/Button';
import Chat from '@platform/components/Chat';
import Files from '@platform/components/Files';

const TeamPage: React.FC = () => {
  const route = useRoute();
  const teamId = (route.params as any)?.teamId;
  const [tab, setTab] = useState('chat');

  const handleJoinRequest = async () => {
    if (!teamId) {
      console.error('Team ID is missing');
      return;
    }
    console.log(`Requesting to join team ${teamId}`);
    alert('Join request sent!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Team: {teamId}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Team Details and Collaboration
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Join Request
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            Send a request to join this team.
          </Text>
          <Button onPress={handleJoinRequest}>Request to Join</Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Pending Join Requests
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            No pending requests.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={tab}
            onValueChange={setTab}
            buttons={[
              { value: 'chat', label: 'Team Chat' },
              { value: 'files', label: 'Team Files' },
            ]}
            style={styles.tabs}
          />
          {tab === 'chat' && teamId && <Chat teamId={teamId} />}
          {tab === 'files' && teamId && <Files teamId={teamId} />}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardText: {
    marginBottom: 16,
    color: '#666',
  },
  tabs: {
    marginBottom: 16,
  },
});

export default TeamPage;
