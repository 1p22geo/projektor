import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Tabs, Tab, List, ListItem, ListItemText, Alert, Button as MuiButton, IconButton, Menu, MenuItem, TextField } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccountCircle as AccountCircleIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
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
    email?: string;
  }>;
  url?: string;
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
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);
  const [team, setTeam] = useState<Team | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMember, setIsMember] = useState(false);
  const [hasRequestPending, setHasRequestPending] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [teamUrl, setTeamUrl] = useState('');

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
    // Check if there's a success message from navigation state
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [teamId, location]);

  useEffect(() => {
    // Load join requests after we know membership status
    if (teamId && isMember) {
      loadJoinRequests();
    }
  }, [teamId, isMember]);

  const loadTeam = async () => {
    try {
      const response = await apiClient.get(`/student/teams/${teamId}`);
      setTeam(response.data);
      setTeamUrl(response.data.url || '');
      
      // Check if current user is a member
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const member = response.data.members?.some((m: any) => m.user_id === user.id);
      setIsMember(member);
    } catch (err: any) {
      setError('Failed to load team details');
    }
  };

  const loadJoinRequests = async () => {
    try {
      const response = await apiClient.get(`/student/teams/${teamId}/join-requests`);
      console.log('Join requests loaded:', response.data);
      setJoinRequests(response.data || []);
    } catch (err: any) {
      // User might not be a member - that's OK
      console.error('Failed to load join requests:', err);
    }
  };

  const handleRequestToJoin = async () => {
    try {
      await apiClient.post(`/student/teams/${teamId}/join-requests`);
      setSuccess('Join request sent');
      setHasRequestPending(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send join request');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await apiClient.put(`/student/teams/${teamId}/join-requests/${requestId}`, { action: 'approve' });
      setSuccess('Request approved');
      await loadJoinRequests();
      await loadTeam();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await apiClient.put(`/student/teams/${teamId}/join-requests/${requestId}`, { action: 'reject' });
      setSuccess('Request rejected');
      await loadJoinRequests();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject request');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAccountSettings = () => {
    handleMenuClose();
    navigate('/account-settings');
  };

  const handleSaveUrl = async () => {
    try {
      await apiClient.put(`/teams/${teamId}`, { url: teamUrl });
      setSuccess('Team URL updated successfully');
      setIsEditingUrl(false);
      await loadTeam();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update team URL');
    }
  };

  const handleCancelEditUrl = () => {
    setTeamUrl(team?.url || '');
    setIsEditingUrl(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Link to="/competitions" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Competitions
          </MuiButton>
        </Link>
        <IconButton
          data-testid="user-menu"
          onClick={handleMenuOpen}
          size="large"
          edge="end"
          color="inherit"
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleAccountSettings}>Account Settings</MenuItem>
          <MenuItem data-testid="logout" onClick={() => { handleMenuClose(); handleLogout(); }}>
            Logout
          </MenuItem>
        </Menu>
      </Box>

      <Typography variant="h3" gutterBottom>
        {team.name}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} role="alert" onClose={() => setSuccess('')}>{success}</Alert>}

      {!isMember && (
        <Paper sx={{ mb: 3, p: 3 }}>
          <Typography variant="body1" gutterBottom>
            You are not a member of this team.
          </Typography>
          {hasRequestPending ? (
            <MuiButton variant="outlined" disabled>
              Request Pending
            </MuiButton>
          ) : (
            <MuiButton variant="contained" onClick={handleRequestToJoin}>
              Request to Join
            </MuiButton>
          )}
        </Paper>
      )}

      {isMember && (
        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="team tabs">
              <Tab label="Members" id="team-tab-0" aria-controls="team-tabpanel-0" />
              <Tab label="Chat" id="team-tab-1" aria-controls="team-tabpanel-1" />
              <Tab label="Files" id="team-tab-2" aria-controls="team-tabpanel-2" />
              <Tab label="Join Requests" id="team-tab-3" aria-controls="team-tabpanel-3" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Team Members
              <Typography component="span" variant="body2" sx={{ ml: 2 }} data-testid="member-count">
                ({team.members.length})
              </Typography>
            </Typography>
            <List data-testid="team-members">
              {team.members.map((member) => (
                <ListItem key={member.user_id}>
                  <ListItemText 
                    primary={member.name}
                    secondary={member.email}
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Team URL
              </Typography>
              {isEditingUrl ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={teamUrl}
                    onChange={(e) => setTeamUrl(e.target.value)}
                    placeholder="https://github.com/your-team/repo"
                    data-testid="team-url-input"
                  />
                  <IconButton onClick={handleSaveUrl} color="primary" data-testid="save-url-btn">
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleCancelEditUrl} data-testid="cancel-url-btn">
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {teamUrl ? (
                    <Link href={teamUrl} target="_blank" rel="noopener noreferrer" data-testid="team-url-link">
                      {teamUrl}
                    </Link>
                  ) : (
                    <Typography color="text.secondary" data-testid="team-url-empty">
                      No URL set
                    </Typography>
                  )}
                  <IconButton onClick={() => setIsEditingUrl(true)} size="small" data-testid="edit-url-btn">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
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
            {joinRequests.length === 0 ? (
              <Alert severity="info">No pending join requests</Alert>
            ) : (
              <List>
                {joinRequests.map((request) => (
                  <ListItem 
                    key={request.id}
                    data-testid="join-request"
                    secondaryAction={
                      <Box>
                        <MuiButton 
                          size="small" 
                          onClick={() => handleApproveRequest(request.id)}
                          sx={{ mr: 1 }}
                          data-testid={`approve-${request.id}`}
                        >
                          Approve
                        </MuiButton>
                        <MuiButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRejectRequest(request.id)}
                          data-testid={`reject-${request.id}`}
                        >
                          Reject
                        </MuiButton>
                      </Box>
                    }
                  >
                    <ListItemText 
                      primary={
                        <>
                          {request.user_name}
                          <Typography component="span" variant="caption" sx={{ display: 'none' }} data-testid="request-id">
                            {request.id}
                          </Typography>
                        </>
                      }
                      secondary={`Approvals: ${request.approvals.length}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </TabPanel>
        </Paper>
      )}
    </Container>
  );
};

export default TeamPage;
