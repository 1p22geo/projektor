import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Chip, Box, Button as MuiButton, Alert, IconButton, Menu, MenuItem } from '@mui/material';
import { Logout as LogoutIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import apiClient from '@core/api/apiClient';

interface Competition {
  id: string;
  name: string;
  description: string;
  is_global: boolean;
  max_teams: number;
  max_members_per_team: number;
  teams?: Array<{
    id: string;
    name: string;
  }>;
}

const Competitions: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [error, setError] = useState('');
  const [myTeams, setMyTeams] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const response = await apiClient.get('/student/competitions');
      setCompetitions(response.data || []);
    } catch (err: any) {
      setError('Failed to load competitions');
    }
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3">
          Competitions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Link to="/teams" style={{ textDecoration: 'none' }}>
            <MuiButton variant="outlined">Teams</MuiButton>
          </Link>
          <Link to="/my-teams" style={{ textDecoration: 'none' }}>
            <MuiButton variant="outlined">My Teams</MuiButton>
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
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {competitions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            No competitions available
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {competitions.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Link to={`/competitions/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h5" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                      {item.name}
                    </Typography>
                  </Link>
                  <Typography color="text.secondary" paragraph>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip label={`Max Teams: ${item.max_teams}`} size="small" />
                    <Chip label={`Max Members: ${item.max_members_per_team}`} size="small" />
                  </Box>
                  <Chip 
                    label={item.is_global ? 'Global' : 'School'} 
                    color={item.is_global ? 'primary' : 'secondary'}
                    size="small"
                  />
                  {item.teams && item.teams.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.teams.length} team(s)
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Link to={`/competitions/${item.id}/create-team`} style={{ textDecoration: 'none' }}>
                    <Button>Create Team</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Competitions;
