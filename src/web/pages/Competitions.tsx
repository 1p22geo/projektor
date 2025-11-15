import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Chip, Box } from '@mui/material';
import Button from '@platform/components/Button';

interface Competition {
  _id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  maxTeams: number;
  maxMembersPerTeam: number;
}

const Competitions: React.FC = () => {
  const competitions: Competition[] = [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Available Competitions
      </Typography>
      {competitions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            No competitions available
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {competitions.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip label={`Max Teams: ${item.maxTeams}`} size="small" />
                    <Chip label={`Max Members: ${item.maxMembersPerTeam}`} size="small" />
                  </Box>
                  <Chip 
                    label={item.isGlobal ? 'Global Competition' : 'School Competition'} 
                    color={item.isGlobal ? 'primary' : 'secondary'}
                    size="small"
                  />
                </CardContent>
                <CardActions>
                  <Link to={`/competitions/${item._id}`} style={{ textDecoration: 'none' }}>
                    <Button>View Details</Button>
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
