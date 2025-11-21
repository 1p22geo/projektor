import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert as RNAlert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Text, Card, Button as PaperButton, TextInput, Portal, Dialog } from 'react-native-paper';
import Button from '@platform/components/Button';
import Input from '@platform/components/Input';
import apiClient from '@core/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Competition {
  id: string;
  name: string;
  description: string;
  is_global: boolean;
  max_teams: number;
  max_members_per_team: number;
  teams?: Array<{
    id: string;
    name: string;
    members: Array<{ user_id: string; name: string; email?: string }>;
  }>;
}

const CompetitionDetails: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { competitionId } = route.params as { competitionId: string };
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [role, setRole] = useState('student');

  useEffect(() => {
    loadRole();
    loadCompetition();
  }, [competitionId]);

  const loadRole = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role || 'student');
    }
  };

  const loadCompetition = async () => {
    try {
      setLoading(true);
      const isHeadteacher = role === 'headteacher';
      const endpoint = isHeadteacher 
        ? `/headteacher/competitions/${competitionId}`
        : `/student/competitions/${competitionId}`;
      
      const response = await apiClient.get(endpoint);
      setCompetition(response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to load competition';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    try {
      const response = await apiClient.post(`/student/competitions/${competitionId}/teams`, {
        name: teamName
      });
      setShowCreateTeamDialog(false);
      setTeamName('');
      
      if (response.data.id) {
        navigation.navigate('Team' as never, { teamId: response.data.id } as never);
      } else {
        setSuccess('Team created successfully');
        await loadCompetition();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team');
      setShowCreateTeamDialog(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    // @ts-ignore
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error && !competition) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <PaperButton mode="outlined" onPress={() => navigation.goBack()}>
          Back to Competitions
        </PaperButton>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <PaperButton mode="outlined" onPress={() => navigation.goBack()}>
          Back
        </PaperButton>
        <PaperButton mode="outlined" onPress={handleLogout}>
          Logout
        </PaperButton>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Text variant="headlineMedium" style={styles.title}>
        {competition?.name}
      </Text>

      <View style={styles.infoCard}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Competition Information
        </Text>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Description</Text>
          <Text variant="bodyMedium">{competition?.description || 'No description'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Scope</Text>
          <Text variant="bodyMedium">{competition?.is_global ? 'Global' : 'School Only'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Max Teams</Text>
          <Text variant="bodyMedium">{competition?.max_teams}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>Max Members Per Team</Text>
          <Text variant="bodyMedium">{competition?.max_members_per_team}</Text>
        </View>
      </View>

      {role !== 'headteacher' && (
        <>
          <Button 
            onPress={() => setShowCreateTeamDialog(true)}
            style={styles.createButton}
          >
            Create Team
          </Button>

          <View style={styles.teamsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Teams ({competition?.teams?.length || 0}/{competition?.max_teams})
            </Text>
            {competition?.teams && competition.teams.length > 0 ? (
              competition.teams.map((team) => (
                <Card 
                  key={team.id} 
                  style={styles.teamCard}
                  onPress={() => navigation.navigate('Team' as never, { teamId: team.id } as never)}
                >
                  <Card.Content>
                    <Text variant="titleMedium">{team.name}</Text>
                    <Text variant="bodySmall" style={styles.memberCount}>
                      Members: {team.members?.length || 0}/{competition.max_members_per_team}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text style={styles.emptyText}>No teams yet</Text>
            )}
          </View>
        </>
      )}

      <Portal>
        <Dialog visible={showCreateTeamDialog} onDismiss={() => setShowCreateTeamDialog(false)}>
          <Dialog.Title>Create Team</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Team Name"
              value={teamName}
              onChangeText={setTeamName}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setShowCreateTeamDialog(false)}>Cancel</PaperButton>
            <PaperButton onPress={handleCreateTeam}>Create</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  infoCard: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  createButton: {
    marginVertical: 16,
  },
  teamsSection: {
    marginTop: 16,
  },
  teamCard: {
    marginBottom: 12,
  },
  memberCount: {
    marginTop: 4,
    color: '#666',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CompetitionDetails;
