import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Card, Button as PaperButton, Chip } from 'react-native-paper';
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

const MyTeams: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadUserId();
    loadMyTeams();
  }, []);

  const loadUserId = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
  };

  const loadMyTeams = async () => {
    try {
      const response = await apiClient.get('/student/competitions');
      setCompetitions(response.data || []);
    } catch (err: any) {
      setError('Failed to load teams');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    // @ts-ignore
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const myTeams = competitions.flatMap(c => 
    (c.teams || [])
      .filter(t => t.members.some(m => m.user_id === userId))
      .map(t => ({ ...t, competition: c }))
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <PaperButton mode="outlined" onPress={() => navigation.navigate('Competitions' as never)}>
            Competitions
          </PaperButton>
          <PaperButton mode="outlined" onPress={() => navigation.navigate('Teams' as never)} style={styles.headerButton}>
            All Teams
          </PaperButton>
        </View>
        <PaperButton mode="outlined" onPress={handleLogout}>
          Logout
        </PaperButton>
      </View>

      <Text variant="headlineLarge" style={styles.title}>
        My Teams
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {myTeams.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            You are not a member of any teams yet
          </Text>
        </View>
      ) : (
        myTeams.map((team) => (
          <Card 
            key={team.id} 
            style={styles.card}
            onPress={() => navigation.navigate('Team' as never, { teamId: team.id } as never)}
          >
            <Card.Content>
              <Text variant="titleLarge">{team.name}</Text>
              <Text variant="bodyMedium" style={styles.competitionName}>
                {team.competition.name}
              </Text>
              <Chip style={styles.chip}>
                {team.members.length}/{team.competition.max_members_per_team} members
              </Chip>
            </Card.Content>
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

export default MyTeams;
