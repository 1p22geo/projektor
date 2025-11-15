import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Button from '@platform/components/Button';

interface Competition {
  _id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  maxTeams: number;
  maxMembersPerTeam: number;
}

const Competitions: React.FC = () => {
  const navigation = useNavigation();
  const competitions: Competition[] = [];

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Available Competitions
      </Text>
      {competitions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No competitions available
          </Text>
        </View>
      ) : (
        competitions.map((item) => (
          <Card key={item._id} style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                {item.name}
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {item.description}
              </Text>
              <View style={styles.chipContainer}>
                <Chip style={styles.chip}>Max Teams: {item.maxTeams}</Chip>
                <Chip style={styles.chip}>Max Members: {item.maxMembersPerTeam}</Chip>
              </View>
              <Chip 
                style={styles.chip}
                mode={item.isGlobal ? 'flat' : 'outlined'}
              >
                {item.isGlobal ? 'Global Competition' : 'School Competition'}
              </Chip>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('CreateTeam' as never)}>
                View Details
              </Button>
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
  title: {
    marginBottom: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default Competitions;
