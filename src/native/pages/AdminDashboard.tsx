import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button as PaperButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    navigation.navigate('AdminLogin');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Admin Dashboard</Title>
        <PaperButton mode="outlined" onPress={handleLogout}>
          Logout
        </PaperButton>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>School Management</Title>
          <Paragraph>
            Manage verified schools, create new ones, or update existing school details.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <PaperButton onPress={() => navigation.navigate('SchoolManagement')}>
            Manage Schools
          </PaperButton>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>User Management</Title>
          <Paragraph>
            Oversee all user accounts, reset passwords, or delete users.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <PaperButton onPress={() => navigation.navigate('UserManagement')}>
            Manage Users
          </PaperButton>
        </Card.Actions>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
});

export default AdminDashboard;
