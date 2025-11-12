import React from 'react';
import { Link } from 'react-router-dom'; // For web/desktop
import { View, Text, FlatList, StyleSheet } from 'react-native'; // For mobile
import Button from '@core/components/Button';
// import useGetCompetitions from '@core/hooks/student/useGetCompetitions'; // Will be implemented in T029

interface Competition {
  _id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  maxTeams: number;
  maxMembersPerTeam: number;
}

const Competitions: React.FC = () => {
  // const { competitions, loading, error } = useGetCompetitions(); // Uncomment when T029 is done
  const competitions: Competition[] = [ // Temporary data
    { _id: 'comp1', name: 'Science Fair 2024', description: 'Annual science competition', isGlobal: false, maxTeams: 10, maxMembersPerTeam: 3 },
    { _id: 'comp2', name: 'Global Coding Challenge', description: 'International coding event', isGlobal: true, maxTeams: 50, maxMembersPerTeam: 4 },
  ];

  // if (loading) return <Text>Loading competitions...</Text>;
  // if (error) return <Text>Error loading competitions: {error.message}</Text>;

  const renderCompetition = ({ item }: { item: Competition }) => (
    <View style={styles.competitionCard}>
      <Text style={styles.competitionTitle}>{item.name}</Text>
      <Text style={styles.competitionDescription}>{item.description}</Text>
      <Text style={styles.competitionDetails}>Max Teams: {item.maxTeams}, Max Members: {item.maxMembersPerTeam}</Text>
      <Text style={styles.competitionDetails}>{item.isGlobal ? 'Global Competition' : 'School Competition'}</Text>
      <Link to={`/competitions/${item._id}`}>
        <Button>View Details</Button>
      </Link>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Competitions</Text>
      <FlatList
        data={competitions}
        renderItem={renderCompetition}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  competitionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  competitionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  competitionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  competitionDetails: {
    fontSize: 12,
    color: '#777',
    marginBottom: 2,
  },
});

export default Competitions;
