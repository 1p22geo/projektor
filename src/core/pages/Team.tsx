import React from 'react';
import { useParams } from 'react-router-dom'; // For web/desktop
import { View, Text, StyleSheet } from 'react-native'; // For mobile
import Button from '@core/components/Button';
// import useRequestToJoinTeam from '@core/hooks/student/useRequestToJoinTeam'; // Will be implemented in T033

const TeamPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  // const { requestToJoinTeam, loading, error } = useRequestToJoinTeam(); // Uncomment when T033 is done

  const handleJoinRequest = async () => {
    if (!teamId) {
      console.error('Team ID is missing');
      return;
    }
    // Placeholder for actual join request logic
    console.log(`Requesting to join team ${teamId}`);
    // const success = await requestToJoinTeam(teamId); // Uncomment when T033 is done
    // if (success) {
    //   alert('Join request sent!');
    // }
    alert('Join request sent!'); // Temporary
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Team: {teamId}</Text>
      <Text style={styles.subHeader}>Team Details and Collaboration</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join Request</Text>
        <Text style={styles.sectionDescription}>Send a request to join this team.</Text>
        <Button onPress={handleJoinRequest}>Request to Join</Button>
        {/* {error && <Text style={styles.errorText}>{error}</Text>} */}
      </View>

      {/* Placeholder for team members to view and approve join requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Join Requests</Text>
        <Text style={styles.sectionDescription}>No pending requests.</Text>
        {/* Example:
        {joinRequests.map(request => (
          <View key={request.id} style={styles.requestItem}>
            <Text>{request.userName} wants to join.</Text>
            <Button onPress={() => handleApprove(request.id)}>Approve</Button>
            <Button onPress={() => handleReject(request.id)} variant="secondary">Reject</Button>
          </View>
        ))}
        */}
      </View>

      {/* Placeholder for chat and files sections (US9) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Chat</Text>
        {/* <Chat teamId={teamId} /> */}
        <Text style={styles.sectionDescription}>Chat component will go here.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Files</Text>
        {/* <Files teamId={teamId} /> */}
        <Text style={styles.sectionDescription}>Files component will go here.</Text>
      </View>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});

export default TeamPage;
