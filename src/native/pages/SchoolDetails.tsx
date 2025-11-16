import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card, Button } from 'react-native-paper';
import apiClient from '@core/api/apiClient';

interface School {
  id: string;
  name: string;
  email: string;
  headteacher_id?: string;
  headteacher?: {
    id: string;
    name: string;
    email: string;
  };
}

const SchoolDetails: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { schoolId } = route.params as { schoolId: string };
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  const loadSchool = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/schools/${schoolId}`);
      setSchool(response.data);
    } catch (err: any) {
      setError('Failed to load school');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !school) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error || 'School not found'}</Text>
        <Button mode="outlined" onPress={() => navigation.goBack()}>
          Back to Schools
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
        Back to Schools
      </Button>
      
      <Text style={styles.title}>{school.name}</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>School Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>School Name</Text>
            <Text style={styles.value}>{school.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{school.email}</Text>
          </View>
          
          {school.headteacher && (
            <>
              <Text style={[styles.sectionTitle, styles.headteacherSection]}>
                Headteacher Information
              </Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{school.headteacher.name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{school.headteacher.email}</Text>
              </View>
            </>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  headteacherSection: {
    marginTop: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default SchoolDetails;
