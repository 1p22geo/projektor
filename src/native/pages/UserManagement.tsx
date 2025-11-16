import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button as PaperButton, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import apiClient from '@core/api/apiClient';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HEADTEACHER' | 'STUDENT';
  school?: {
    _id: string;
    name: string;
  };
}

const UserManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const handleResetPassword = async (userId: string) => {
    Alert.alert(
      'Confirm Reset',
      'Reset password for this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await apiClient.put(`/admin/users/${userId}/reset-password`);
              Alert.alert('Success', 'Password reset successfully');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to reset password');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/users/${userId}`);
              setUsers(users.filter(u => u._id !== userId));
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete user');
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

      <Title style={styles.title}>User Management</Title>

      {users.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>No users found.</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        users.map((user) => (
          <Card key={user._id} style={styles.card}>
            <Card.Content>
              <View style={styles.userHeader}>
                <Title>{user.name}</Title>
                <Chip mode="outlined">{user.role}</Chip>
              </View>
              <Paragraph>Email: {user.email}</Paragraph>
              {user.school && <Paragraph>School: {user.school.name}</Paragraph>}
            </Card.Content>
            <Card.Actions>
              <PaperButton onPress={() => handleResetPassword(user._id)}>
                Reset Password
              </PaperButton>
              <PaperButton onPress={() => handleDeleteUser(user._id)}>
                Delete
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default UserManagement;
