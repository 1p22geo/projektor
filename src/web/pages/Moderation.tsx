import React, { useState, useMemo } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Tabs, Tab, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Button from '@core/components/Button';
import Layout from '@core/components/Layout';
import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';
import { useNavigate } from 'react-router-dom';

interface Team {
  _id: string;
  name: string;
  competition_id: string;
  members: any[];
}

interface Competition {
  id: string;
  name: string;
}

const Moderation: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const { data: teams, error, isLoading } = useSWR<Team[]>('/headteacher/teams', fetcher);
  const { data: competitions } = useSWR<Competition[]>('/headteacher/competitions', fetcher);

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    
    let result = teams;
    
    // Filter by competition
    if (selectedCompetition) {
      result = result.filter(team => team.competition_id === selectedCompetition);
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return result;
  }, [teams, selectedCompetition, searchTerm]);

  const handleViewTeam = (teamId: string) => {
    navigate(`/moderation/team/${teamId}`);
  };

  const handleExport = () => {
    if (!filteredTeams || filteredTeams.length === 0) return;
    
    const csvData = filteredTeams.map(team => ({
      name: team.name,
      members: team.members?.length || 0,
      competition_id: team.competition_id,
    }));
    
    const csvContent = [
      ['Team Name', 'Members', 'Competition ID'].join(','),
      ...csvData.map(row => [row.name, row.members, row.competition_id].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teams-export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Moderation Dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Moderation
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Teams" />
          <Tab label="Competitions" />
          <Tab label="Activity Log" />
        </Tabs>

        {tab === 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                name="search"
                label="Search teams"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Competition</InputLabel>
                <Select
                  name="competition"
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  label="Filter by Competition"
                >
                  <MenuItem value="">All Competitions</MenuItem>
                  {competitions?.map((comp) => (
                    <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button onClick={handleExport}>Export</Button>
            </Box>

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 4 }}>
                Failed to load teams
              </Alert>
            )}

            {!isLoading && !error && filteredTeams && filteredTeams.length === 0 && (
              <Alert severity="info" sx={{ mt: 4 }}>
                No teams to moderate at the moment.
              </Alert>
            )}

            <Box data-testid="team-list">
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {filteredTeams?.map((team) => (
                  <Grid item xs={12} md={6} key={team._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {team.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {team.members?.length || 0} members
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => handleViewTeam(team._id)}>View Team</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

        {tab === 1 && (
          <Box data-testid="competitions-list">
            {!competitions || competitions.length === 0 ? (
              <Alert severity="info">No competitions available</Alert>
            ) : (
              <Grid container spacing={3}>
                {competitions?.map((comp) => (
                  <Grid item xs={12} md={6} key={comp.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5">{comp.name}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box data-testid="activity-log">
            <Alert severity="info">
              Activity log coming soon
            </Alert>
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default Moderation;