import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText, Divider, IconButton, Tabs, Tab } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import Button from '@core/components/Button';
import Input from '@core/components/Input';
import Layout from '@core/components/Layout';
import { useTeam } from '@core/hooks/student/useTeam';
import { useRequestToJoinTeam } from '@core/hooks/student/useRequestToJoinTeam';
import { useJoinRequests } from '@core/hooks/student/useJoinRequests';
import { useHandleJoinRequest } from '@core/hooks/student/useHandleJoinRequest';
import Chat from '@core/components/Chat';
import Files from '@core/components/Files';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Team: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [requestId, setRequestId] = useState<string | null>(null);
  const { team, isLoading, error, mutate } = useTeam(teamId);
  const { requestToJoin, loading: requestLoading, error: requestError } = useRequestToJoinTeam();
  const { joinRequests, isLoading: requestsLoading, error: requestsError, mutate: mutateRequests } = useJoinRequests(teamId || '');
  const { handleRequest, loading: handleRequestLoading, error: handleRequestError } = useHandleJoinRequest(teamId || '');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isMember = team?.members.some(m => m.user_id === user.id);
  const hasRequestedToJoin = joinRequests?.some(r => r.user_id === user.id && r.status === 'PENDING');

  const handleJoinRequest = async () => {
    if (!teamId) return;
    const result = await requestToJoin(teamId);
    if (result.success) {
      if (result.requestId) {
        setRequestId(result.requestId);
      }
      mutate();
      mutateRequests();
    }
  };

  const handleApproveReject = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const success = await handleRequest(requestId, status);
    if (success) {
      alert(`Request ${status.toLowerCase()} successfully!`);
      mutateRequests();
      mutate();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          <Alert role="alert" severity="error" sx={{ mt: 2 }}>
            {requestError}
          </Alert>
        )}

        {(hasRequestedToJoin || requestId) && (
          <Alert role="alert" severity="success" sx={{ mt: 2 }}>
            Join request sent!
            <Typography 
              data-testid="request-id" 
              component="span"
              sx={{ ml: 1, display: 'inline' }}
            >
              {requestId || joinRequests?.find(r => r.user_id === user.id && r.status === 'PENDING')?.id || ''}
            </Typography>
          </Alert>
        )}

        {handleRequestError && (
          <Alert role="alert" severity="error" sx={{ mt: 2 }}>
            {handleRequestError}
          </Alert>
        )}

        {team && (
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {team.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" data-testid="member-count" sx={{ mb: 2 }}>
              Members: {team.members?.length || 0}
            </Typography>

            {!isMember && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Button 
                  onClick={handleJoinRequest} 
                  disabled={requestLoading || hasRequestedToJoin}
                  data-testid="join-button"
                >
                  {requestLoading ? (
                    <CircularProgress size={24} />
                  ) : hasRequestedToJoin ? (
                    'Request Pending'
                  ) : (
                    'Request to Join'
                  )}
                </Button>
              </Box>
            )}

            {isMember && (
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="team tabs">
                    <Tab label="Members" role="tab" />
                    <Tab label="Chat" role="tab" />
                    <Tab label="Files" role="tab" />
                    <Tab label="Join Requests" role="tab" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Members:
                  </Typography>
                  <List data-testid="team-members">
                    {team.members.map((member) => (
                      <ListItem key={member.user_id}>
                        <ListItemText primary={member.name} />
                      </ListItem>
                    ))}
                  </List>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {teamId && <Chat teamId={teamId} />}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {teamId && <Files teamId={teamId} />}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Typography variant="h6" gutterBottom>
                    Join Requests
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
                  {joinRequests && joinRequests.filter(r => r.status === 'PENDING').length > 0 ? (
                    <List>
                      {joinRequests.filter(req => req.status === 'PENDING').map((request) => (
                        <ListItem 
                          key={request.id}
                          data-testid="join-request"
                          secondaryAction={
                            <Box>
                              <IconButton 
                                edge="end" 
                                aria-label="approve" 
                                onClick={() => handleApproveReject(request.id, 'APPROVED')} 
                                disabled={handleRequestLoading}
                                data-testid={`approve-${request.id}`}
                              >
                                <CheckIcon color="success" />
                              </IconButton>
                              <IconButton 
                                edge="end" 
                                aria-label="reject" 
                                onClick={() => handleApproveReject(request.id, 'REJECTED')} 
                                disabled={handleRequestLoading}
                                data-testid={`reject-${request.id}`}
                              >
                                <CloseIcon color="error" />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemText 
                            primary={request.user_name} 
                            secondary={`Requested to join on ${new Date(request.created_at).toLocaleDateString()}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">No pending join requests</Typography>
                  )}
                </TabPanel>
              </>
            )}
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default Team;