import React from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, CardActions } from '@mui/material';
import Button from '@core/components/Button';
import Layout from '@core/components/Layout';
// import { useTeamsForModeration } from '@core/hooks/headteacher/useTeamsForModeration'; // Will be implemented later
import { useNavigate } from 'react-router-dom';

interface Team {
  id: string;
  name: string;
  competition_id: string;
  // Add other relevant team details for moderation
}

const Moderation: React.FC = () => {
  const navigate = useNavigate();
  // const { teams, isLoading, error } = useTeamsForModeration(); // Uncomment when useTeamsForModeration is implemented
  const teams: Team[] = []; // Temporary placeholder
  const isLoading = false; // Temporary placeholder
  const error = null; // Temporary placeholder

  const handleViewTeam = (teamId: string) => {
    navigate(`/headteacher/moderation/${teamId}`);
  };

  return (
    <Layout title="Moderation Dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Team Moderation
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            Failed to load teams: {error}
          </Alert>
        )}

        {!isLoading && !error && teams.length === 0 && (
          <Alert severity="info" sx={{ mt: 4 }}>
            No teams to moderate at the moment.
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 4 }}>
          {teams.map((team) => (
            <Grid item xs={12} md={6} key={team.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {team.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Competition ID: {team.competition_id}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewTeam(team.id)}>View Team</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
};

export default Moderation;