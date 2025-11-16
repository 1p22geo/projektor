import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert, CircularProgress } from '@mui/material';
import Input from '@core/components/Input';
import Button from '@core/components/Button';
import { useCreateTeam } from '@core/hooks/student/useCreateTeam'; // Will be implemented in T031
import Layout from '@core/components/Layout';

const CreateTeam: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const { createTeam, loading, error } = useCreateTeam(); // Uncomment when T031 is done

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionId) {
      // Handle error: competitionId is missing
      return;
    }
    const success = await createTeam(competitionId, teamName); // Uncomment when T031 is done
    if (success) {
      navigate(`/competitions`); // Redirect to competition details or team page
    }
  };

  return (
    <Layout title="Create Team">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create New Team
          </Typography>
          <Typography variant="h6" component="h2" align="center" gutterBottom>
            for Competition: {competitionId}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Input
              name="teamName"
              label="Team Name"
              type="text"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : 'Create Team'}
            </Button>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default CreateTeam;
