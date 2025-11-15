import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box } from '@mui/material';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';

const CreateTeam: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionId) {
      console.error('Competition ID is missing');
      return;
    }
    console.log(`Creating team "${teamName}" for competition ${competitionId}`);
    navigate(`/competitions/${competitionId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Team
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          For Competition: {competitionId}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Input
            label="Team Name"
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          <Box sx={{ mt: 2 }}>
            <Button type="submit">Create Team</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTeam;
