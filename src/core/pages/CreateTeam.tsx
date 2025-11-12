import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // For web/desktop
import { View, Text, StyleSheet } from 'react-native'; // For mobile
import Input from '@core/components/Input';
import Button from '@core/components/Button';
// import useCreateTeam from '@core/hooks/student/useCreateTeam'; // Will be implemented in T031

const CreateTeam: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();
  // const { createTeam, loading, error } = useCreateTeam(); // Uncomment when T031 is done

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionId) {
      console.error('Competition ID is missing');
      return;
    }
    // Placeholder for actual team creation logic
    console.log(`Creating team "${teamName}" for competition ${competitionId}`);
    // const success = await createTeam(competitionId, teamName); // Uncomment when T031 is done
    // if (success) {
    //   navigate(`/competitions/${competitionId}/teams`); // Redirect to team list
    // }
    navigate(`/competitions/${competitionId}/teams`); // Temporary redirect
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create New Team</Text>
      <Text style={styles.subHeader}>For Competition: {competitionId}</Text>
      <form onSubmit={handleSubmit}>
        <Input
          label="Team Name"
          type="text"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
        <Button type="submit">Create Team</Button>
      </form>
      {/* {error && <Text style={styles.errorText}>{error}</Text>} */}
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
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});

export default CreateTeam;
