import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, CardActions } from '@mui/material';
import Button from '@core/components/Button';
import Layout from '@core/components/Layout';
import { useGetCompetitions } from '@core/hooks/student/useGetCompetitions'; // Will be implemented in T029

interface Competition {
  id: string;
  name: string;
  description: string;
  school_id: string;
  is_global: boolean;
  max_teams: number;
  max_members_per_team: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const Competitions: React.FC = () => {
  const navigate = useNavigate();
  const { competitions, isLoading, error } = useGetCompetitions(); // Uncomment when T029 is done

  const handleCreateTeam = (competitionId: string) => {
    navigate(`/competitions/${competitionId}/create-team`);
  };

  const handleViewCompetition = (competitionId: string) => {
    navigate(`/competitions/${competitionId}`);
  };

  return (
    <Layout title="Competitions">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Competitions
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            Failed to load competitions: {error}
          </Alert>
        )}

        {!isLoading && !error && competitions.length === 0 && (
          <Alert severity="info" sx={{ mt: 4 }}>
            No competitions available at the moment.
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 4 }}>
          {competitions.map((competition) => (
            <Grid item xs={12} md={6} key={competition.id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => handleViewCompetition(competition.id)}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {competition.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {competition.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">Max Teams: {competition.max_teams}</Typography>
                    <Typography variant="body2">Max Members per Team: {competition.max_members_per_team}</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateTeam(competition.id);
                    }}
                  >
                    Create Team
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
};

export default Competitions;
