import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Typography, Paper, Box, Alert, Button as MuiButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';
import apiClient from '@core/api/apiClient';

const CreateTeam: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionId) {
      setError('Competition ID is missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post(`/competitions/${competitionId}/teams`, {
        name: teamName,
        competition_id: competitionId
      });
      
      // Navigate to the newly created team
      navigate(`/teams/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link to="/competitions" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Competitions
          </MuiButton>
        </Link>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Team
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Input
            name="name"
            label="Team Name"
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          <Box sx={{ mt: 2 }}>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTeam;
