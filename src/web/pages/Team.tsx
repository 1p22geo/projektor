import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Paper, Box, Tabs, Tab, List, ListItem, ListItemText, Alert, Button as MuiButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import Chat from '@platform/components/Chat';
import Files from '@platform/components/Files';
import apiClient from '@core/api/apiClient';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Team {
  id: string;
  name: string;
  competition_id: string;
  members: Array<{
    user_id: string;
    name: string;
  }>;
}

interface JoinRequest {
  id: string;
  user_id: string;
  user_name: string;
  status: string;
  approvals: string[];
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

const TeamPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [tabValue, setTabValue] = React.useState(0);
  const [team, setTeam] = useState<Team | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (teamId) {
      loadTeam();
      loadJoinRequests();
    }
  }, [teamId]);

  const loadTeam = async () => {
    try {
      const response = await apiClient.get(`/teams/${teamId}`);
      setTeam(response.data);
    } catch (err: any) {
      setError('Failed to load team details');
    }
  };

  const loadJoinRequests = async () => {
    try {
      const response = await apiClient.get(`/teams/${teamId}/join-requests`);
      setJoinRequests(response.data || []);
    } catch (err: any) {
      // User might not be a member - that's OK
      console.error('Failed to load join requests:', err);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await apiClient.put(`/teams/${teamId}/join-requests/${requestId}`, { action: 'approve' });
      setSuccess('Request processed');
      await loadJoinRequests();
      await loadTeam();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await apiClient.put(`/teams/${teamId}/join-requests/${requestId}`, { action: 'reject' });
      setSuccess('Request rejected');
      await loadJoinRequests();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject request');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!team) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading team...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link to="/competitions" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Competitions
          </MuiButton>
        </Link>
      </Box>

      <Typography variant="h3" gutterBottom>
        {team.name}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Team Members
        </Typography>
        <List>
          {team.members.map((member) => (
            <ListItem key={member.user_id}>
              <ListItemText primary={member.name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {joinRequests.length > 0 && (
        <Paper sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Join Requests
          </Typography>
          <List>
            {joinRequests.map((request) => (
              <ListItem 
                key={request.id}
                secondaryAction={
                  <Box>
                    <MuiButton 
                      size="small" 
                      onClick={() => handleApproveRequest(request.id)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </MuiButton>
                    <MuiButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Reject
                    </MuiButton>
                  </Box>
                }
              >
                <ListItemText 
                  primary={request.user_name}
                  secondary={`Approvals: ${request.approvals.length}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="team tabs">
            <Tab label="Chat" id="team-tab-0" aria-controls="team-tabpanel-0" />
            <Tab label="Files" id="team-tab-1" aria-controls="team-tabpanel-1" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {teamId && <Chat teamId={teamId} />}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {teamId && <Files teamId={teamId} />}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TeamPage;
