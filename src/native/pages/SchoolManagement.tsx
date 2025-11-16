import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button as PaperButton, TextInput, DataTable, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import apiClient from '@core/api/apiClient';

interface School {
  id: string;
  name: string;
  email: string;
  headteacher?: {
    id: string;
    name: string;
    email: string;
  };
}

const SchoolManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const [schools, setSchools] = useState<School[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await apiClient.get('/admin/schools');
      setSchools(response.data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load schools');
    }
  };

  const handleCreateSchool = async () => {
    try {
      const response = await apiClient.post('/admin/schools', {
        name: newSchoolName,
        email: schoolEmail
      });
      
      setGeneratedPassword(response.data.generated_password);
      Alert.alert('Success', `School created! Password: ${response.data.generated_password}`);
      setShowCreateForm(false);
      setNewSchoolName('');
      setSchoolEmail('');
      loadSchools();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to create school');
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this school?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/schools/${schoolId}`);
              loadSchools();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete school');
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

      <Title style={styles.title}>School Management</Title>

      <PaperButton mode="contained" onPress={() => setShowCreateForm(true)} style={styles.createButton}>
        Create School
      </PaperButton>

      {schools.map((school) => (
        <Card key={school.id} style={styles.card} onPress={() => navigation.navigate('SchoolDetails', { schoolId: school.id })}>
          <Card.Content>
            <Title>{school.name}</Title>
            <Paragraph>Email: {school.email}</Paragraph>
            {school.headteacher && (
              <Paragraph>Headteacher: {school.headteacher.name}</Paragraph>
            )}
          </Card.Content>
          <Card.Actions>
            <PaperButton onPress={(e) => { e.stopPropagation(); handleDeleteSchool(school.id); }}>
              Delete
            </PaperButton>
          </Card.Actions>
        </Card>
      ))}

      <Portal>
        <Dialog visible={showCreateForm} onDismiss={() => setShowCreateForm(false)}>
          <Dialog.Title>Create New School</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="School Name"
              value={newSchoolName}
              onChangeText={setNewSchoolName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="School Email"
              value={schoolEmail}
              onChangeText={setSchoolEmail}
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setShowCreateForm(false)}>Cancel</PaperButton>
            <PaperButton onPress={handleCreateSchool}>Create</PaperButton>
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

export default SchoolManagement;
