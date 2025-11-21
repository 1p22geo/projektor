import React, { useState, useEffect } from 'react';
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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const navigate = useNavigate();

  // Check if user is already in a team for this competition
  useEffect(() => {
    const checkEligibility = async () => {
      if (!competitionId) return;
      
      try {
        const response = await apiClient.get(`/student/competitions/${competitionId}`);
        const competition = response.data;
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        // Check if user is already in a team for this competition
        if (competition.teams && user) {
          const userInTeam = competition.teams.some((team: any) =>
            team.members?.some((member: any) => member.user_id === user.id || member.email === user.email)
          );
          
          if (userInTeam) {
            setError('Already in a team for this competition');
          }
        }
      } catch (err) {
        console.error('Failed to check eligibility:', err);
      } finally {
        setCheckingEligibility(false);
      }
    };
    
    checkEligibility();
  }, [competitionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionId) {
      setError('Competition ID is missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post(`/student/competitions/${competitionId}/teams`, {
        name: teamName,
        competition_id: competitionId
      });
      
      // Navigate with success message
      navigate(`/teams/${response.data.id}`, { state: { successMessage: 'Team created successfully' } });
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
          <Alert severity="error" sx={{ mb: 2 }} role="alert" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} role="alert">
            {success}
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
