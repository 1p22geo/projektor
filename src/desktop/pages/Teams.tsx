import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Box,
  Alert,
  Button as MuiButton,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import apiClient from '@core/api/apiClient';

interface Team {
  id: string;
  name: string;
  competition_id: string;
  members: Array<{ user_id: string; name: string; email?: string }>;
}

interface Competition {
  id: string;
  name: string;
  max_members_per_team: number;
  teams?: Team[];
}

const Teams: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestedTeams, setRequestedTeams] = useState<Set<string>>(new Set());
  const [requestIds, setRequestIds] = useState<Map<string, string>>(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const response = await apiClient.get('/student/competitions');
      setCompetitions(response.data || []);
    } catch (err: any) {
      setError('Failed to load teams');
    }
  };

  const handleRequestToJoin = async (teamId: string) => {
    try {
      const response = await apiClient.post(`/student/teams/${teamId}/join-requests`);
      setSuccess('Join request sent');
      setRequestedTeams(prev => new Set([...prev, teamId]));
      
      if (response.data?.id) {
        setRequestIds(prev => new Map(prev).set(teamId, response.data.id));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to send join request';
      setError(errorMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const allTeams = competitions.flatMap(c => 
    (c.teams || []).map(t => ({ ...t, competition: c }))
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link to="/competitions" style={{ textDecoration: 'none' }}>
            <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
              Back to Competitions
            </MuiButton>
          </Link>
          <Link to="/my-teams" style={{ textDecoration: 'none' }}>
            <MuiButton variant="outlined">My Teams</MuiButton>
          </Link>
        </Box>
        <MuiButton 
          data-testid="logout" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          variant="outlined"
        >
          Logout
        </MuiButton>
      </Box>

      <Typography variant="h3" gutterBottom>
        Teams
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} role="alert" onClose={() => setSuccess('')}>
        {success}
        {Array.from(requestIds.values()).map(id => (
          <Typography key={id} component="span" variant="caption" sx={{ display: 'none' }} data-testid="request-id">
            {id}
          </Typography>
        ))}
      </Alert>}

      {allTeams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            No teams available
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {allTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card>
                <CardContent>
                  <Link to={`/teams/${team.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h6" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                      {team.name}
                    </Typography>
                  </Link>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {team.competition.name}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`${team.members.length}/${team.competition.max_members_per_team} members`} 
                      size="small" 
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  {requestedTeams.has(team.id) ? (
                    <Button disabled fullWidth>
                      Request Pending
                    </Button>
                  ) : (
                    <Button onClick={() => handleRequestToJoin(team.id)} fullWidth>
                      Request to Join
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Teams;
