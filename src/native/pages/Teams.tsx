import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Card, Button as PaperButton, Chip } from 'react-native-paper';
import Button from '@platform/components/Button';
import apiClient from '@core/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Team {
  id: string;
  name: string;
  competition_id: string;
  members: Array<{ user_id: string; name: string; email?: string }>;
}

interface Competition {
  id: string;
  name: string;
  max_members_per_team: number;
  teams?: Team[];
}

const Teams: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestedTeams, setRequestedTeams] = useState<Set<string>>(new Set());
  const navigation = useNavigation();

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const response = await apiClient.get('/student/competitions');
      setCompetitions(response.data || []);
    } catch (err: any) {
      setError('Failed to load teams');
    }
  };

  const handleRequestToJoin = async (teamId: string) => {
    try {
      await apiClient.post(`/student/teams/${teamId}/join-requests`);
      setSuccess('Join request sent');
      setRequestedTeams(prev => new Set([...prev, teamId]));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to send join request';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    // @ts-ignore
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const allTeams = competitions.flatMap(c => 
    (c.teams || []).map(t => ({ ...t, competition: c }))
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <PaperButton mode="outlined" onPress={() => navigation.navigate('Competitions' as never)}>
            Competitions
          </PaperButton>
          <PaperButton mode="outlined" onPress={() => navigation.navigate('MyTeams' as never)} style={styles.headerButton}>
            My Teams
          </PaperButton>
        </View>
        <PaperButton mode="outlined" onPress={handleLogout}>
          Logout
        </PaperButton>
      </View>

      <Text variant="headlineLarge" style={styles.title}>
        Teams
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      {allTeams.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No teams available</Text>
        </View>
      ) : (
        allTeams.map((team) => (
          <Card key={team.id} style={styles.card}>
            <Card.Content>
              <Text 
                variant="titleLarge"
                onPress={() => navigation.navigate('Team' as never, { teamId: team.id } as never)}
              >
                {team.name}
              </Text>
              <Text variant="bodyMedium" style={styles.competitionName}>
                {team.competition.name}
              </Text>
              <Chip style={styles.chip}>
                {team.members.length}/{team.competition.max_members_per_team} members
              </Chip>
            </Card.Content>
            <Card.Actions>
              {requestedTeams.has(team.id) ? (
                <Button disabled fullWidth>Request Pending</Button>
              ) : (
                <Button onPress={() => handleRequestToJoin(team.id)} fullWidth>
                  Request to Join
                </Button>
              )}
            </Card.Actions>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    marginLeft: 8,
  },
  title: {
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  success: {
    color: 'green',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  card: {
    marginBottom: 12,
  },
  competitionName: {
    marginTop: 8,
    color: '#666',
  },
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});

export default Teams;
