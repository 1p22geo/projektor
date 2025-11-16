import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button as PaperButton, TextInput, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import apiClient from '@core/api/apiClient';

interface Competition {
  id: string;
  name: string;
  description: string;
  max_teams: number;
  max_members_per_team: number;
  is_global: boolean;
}

const CompetitionManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxTeams, setMaxTeams] = useState('10');
  const [maxMembers, setMaxMembers] = useState('5');
  const [isGlobal, setIsGlobal] = useState(false);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const response = await apiClient.get('/headteacher/competitions');
      setCompetitions(response.data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load competitions');
    }
  };

  const handleCreateCompetition = async () => {
    try {
      await apiClient.post('/headteacher/competitions', {
        name,
        description,
        max_teams: parseInt(maxTeams),
        max_members_per_team: parseInt(maxMembers),
        is_global: isGlobal
      });
      
      Alert.alert('Success', 'Competition created successfully');
      setShowCreateForm(false);
      setName('');
      setDescription('');
      setMaxTeams('10');
      setMaxMembers('5');
      setIsGlobal(false);
      loadCompetitions();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to create competition');
    }
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this competition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/headteacher/competitions/${competitionId}`);
              loadCompetitions();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete competition');
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

      <Title style={styles.title}>Competition Management</Title>

      <PaperButton mode="contained" onPress={() => setShowCreateForm(true)} style={styles.createButton}>
        Create Competition
      </PaperButton>

      {competitions.map((competition) => (
        <Card key={competition.id} style={styles.card}>
          <Card.Content>
            <Title>{competition.name}</Title>
            <Paragraph>{competition.description}</Paragraph>
            <Paragraph>Max Teams: {competition.max_teams}</Paragraph>
            <Paragraph>Max Members: {competition.max_members_per_team}</Paragraph>
            <Paragraph>Scope: {competition.is_global ? 'Global' : 'School'}</Paragraph>
          </Card.Content>
          <Card.Actions>
            <PaperButton onPress={() => handleDeleteCompetition(competition.id)}>
              Delete
            </PaperButton>
          </Card.Actions>
        </Card>
      ))}

      <Portal>
        <Dialog visible={showCreateForm} onDismiss={() => setShowCreateForm(false)}>
          <Dialog.Title>Create New Competition</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                label="Competition Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <TextInput
                label="Max Teams"
                value={maxTeams}
                onChangeText={setMaxTeams}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Max Members Per Team"
                value={maxMembers}
                onChangeText={setMaxMembers}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <PaperButton onPress={() => setShowCreateForm(false)}>Cancel</PaperButton>
            <PaperButton onPress={handleCreateCompetition}>Create</PaperButton>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  createButton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginVertical: 8,
  },
});

export default CompetitionManagement;
