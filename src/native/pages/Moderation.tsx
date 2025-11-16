import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button as PaperButton, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@core/api/apiClient';

interface Team {
  id: string;
  name: string;
  competition: {
    name: string;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

const Moderation: React.FC = () => {
  const navigation = useNavigation<any>();
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const response = await apiClient.get(`/headteacher/schools/${user.school_id}/teams`);
      setTeams(response.data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load teams');
    }
  };

  const handleViewTeam = (teamId: string) => {
    navigation.navigate('Team', { teamId });
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    Alert.alert(
      'Confirm Remove',
      'Remove this member from the team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/headteacher/teams/${teamId}/members/${memberId}`);
              loadTeams();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to remove member');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <PaperButton icon="arrow-left" onPress={() => navigation.goBack()}>
          Back
        </PaperButton>
      </View>

      <Title style={styles.title}>Team Moderation</Title>

      {teams.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>No teams found.</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        teams.map((team) => (
          <Card key={team.id} style={styles.card}>
            <Card.Content>
              <Title>{team.name}</Title>
              <Paragraph>Competition: {team.competition.name}</Paragraph>
              <Paragraph style={styles.membersTitle}>Members ({team.members.length}):</Paragraph>
              {team.members.map((member) => (
                <List.Item
                  key={member.id}
                  title={member.name}
                  description={member.email}
                  right={(props) => (
                    <PaperButton onPress={() => handleRemoveMember(team.id, member.id)}>
                      Remove
                    </PaperButton>
                  )}
                />
              ))}
            </Card.Content>
            <Card.Actions>
              <PaperButton onPress={() => handleViewTeam(team.id)}>
                View Chat & Files
              </PaperButton>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  membersTitle: {
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default Moderation;
