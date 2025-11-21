import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Box,
  Alert,
  Button as MuiButton,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon } from '@mui/icons-material';
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

const MyTeams: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadMyTeams();
  }, []);

  const loadMyTeams = async () => {
    try {
      const response = await apiClient.get('/student/competitions');
      setCompetitions(response.data || []);
    } catch (err: any) {
      setError('Failed to load teams');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  // Filter to only teams where the user is a member
  const myTeams = competitions.flatMap(c => 
    (c.teams || [])
      .filter(t => t.members.some(m => m.user_id === userId))
      .map(t => ({ ...t, competition: c }))
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
          <Link to="/teams" style={{ textDecoration: 'none' }}>
            <MuiButton variant="outlined">All Teams</MuiButton>
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
        My Teams
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {myTeams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            You are not a member of any teams yet
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {myTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/teams/${team.id}`)}>
                <CardContent>
                  <Typography variant="h6">
                    {team.name}
                  </Typography>
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
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyTeams;
