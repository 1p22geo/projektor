import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import Button from '@core/components/Button';
import Layout from '@core/components/Layout';
import { useTeam } from '@core/hooks/student/useTeam'; // Will be implemented later
import { useRequestToJoinTeam } from '@core/hooks/student/useRequestToJoinTeam';
import { useJoinRequests } from '@core/hooks/student/useJoinRequests';
import { useHandleJoinRequest } from '@core/hooks/student/useHandleJoinRequest';
import Chat from '@core/components/Chat';

interface TeamMember {
  user_id: string;
  name: string;
}

interface TeamData {
  id: string;
  name: string;
  competition_id: string;
  members: TeamMember[];
  chat: any[]; // Placeholder for chat messages
  files: any[]; // Placeholder for files
  created_at: string;
  updated_at: string;
}

interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvals: string[]; // Array of user IDs who approved
  created_at: string;
  updated_at: string;
}

const Team: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { team, isLoading, error, mutate } = useTeam(teamId); // Uncomment when useTeam is implemented
  const { requestToJoin, loading: requestLoading, error: requestError } = useRequestToJoinTeam();
  const { joinRequests, isLoading: requestsLoading, error: requestsError, mutate: mutateRequests } = useJoinRequests(teamId || '');
  const { handleRequest, loading: handleRequestLoading, error: handleRequestError } = useHandleJoinRequest(teamId || '');

  const handleJoinRequest = async () => {
    if (!teamId) return;
    const success = await requestToJoin(teamId);
    if (success) {
      alert('Join request sent!');
      mutate(); // Revalidate team data
    }
  };

  const handleApproveReject = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const success = await handleRequest(requestId, status);
    if (success) {
      alert(`Request ${status.toLowerCase()} successfully!`);
      mutateRequests(); // Revalidate join requests
      mutate(); // Revalidate team data (in case member was added)
    }
  };

  return (
    <Layout title={`Team: ${team?.name || 'Loading...'}`}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            Failed to load team: {error}
          </Alert>
        )}

        {requestError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to send join request: {requestError}
          </Alert>
        )}

        {handleRequestError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to handle join request: {handleRequestError}
          </Alert>
        )}

        {team && (
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {team.name}
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom>
              Members:
            </Typography>
            <List>
              {team.members.map((member) => (
                <ListItem key={member.user_id}>
                  <ListItemText primary={member.name} />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleJoinRequest} disabled={requestLoading}>
                {requestLoading ? <CircularProgress size={24} /> : 'Request to Join Team'}
              </Button>
            </Box>

            {/* Join Requests Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Pending Join Requests:
              </Typography>
              {requestsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              {requestsError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Failed to load join requests: {requestsError}
                </Alert>
              )}
              {!requestsLoading && !requestsError && joinRequests && joinRequests.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No pending join requests.
                </Typography>
              )}
              {joinRequests && joinRequests.length > 0 && (
                <List>
                  {joinRequests.filter(req => req.status === 'PENDING').map((request) => (
                    <ListItem 
                      key={request.id} 
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="approve" onClick={() => handleApproveReject(request.id, 'APPROVED')} disabled={handleRequestLoading}>
                            <CheckIcon color="success" />
                          </IconButton>
                          <IconButton edge="end" aria-label="reject" onClick={() => handleApproveReject(request.id, 'REJECTED')} disabled={handleRequestLoading}>
                            <CloseIcon color="error" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText primary={request.user_name} secondary={`Requested to join on ${new Date(request.created_at).toLocaleDateString()}`} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Chat Section */}
            {teamId && <Chat teamId={teamId} />}

            {/* Files Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Team Files
              </Typography>
              <Paper variant="outlined" sx={{ minHeight: 150, overflow: 'auto', p: 2, mb: 2 }}>
                {/* File list will go here */}
                {team.files.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No files uploaded yet.</Typography>
                ) : (
                  <List>
                    {team.files.map((file, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText primary={file.filename} secondary={`${(file.size / 1024).toFixed(2)} KB - ${new Date(file.created_at).toLocaleDateString()}`} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input
                  type="file"
                  // onChange={handleFileChange} // To be implemented with state
                />
                <Button variant="contained">Upload</Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default Team;