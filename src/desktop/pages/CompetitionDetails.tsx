import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button as MuiButton, 
  Box,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import Input from '@platform/components/Input';
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
    members: Array<{ user_id: string; name: string; email?: string }>;
  }>;
}

const CompetitionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams<{ competitionId: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'school',
    max_teams: 10,
    max_members_per_team: 4,
  });
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'student';
  const isHeadteacher = role === 'headteacher';

  useEffect(() => {
    loadCompetition();
  }, [competitionId]);

  const loadCompetition = async () => {
    try {
      setLoading(true);
      
      const endpoint = isHeadteacher 
        ? `/headteacher/competitions/${competitionId}`
        : `/student/competitions/${competitionId}`;
      
      const response = await apiClient.get(endpoint);
      setCompetition(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description,
        scope: response.data.is_global ? 'global' : 'school',
        max_teams: response.data.max_teams,
        max_members_per_team: response.data.max_members_per_team,
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load competition';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/headteacher/competitions/${competitionId}`, {
        ...formData,
        is_global: formData.scope === 'global'
      });
      setShowEditDialog(false);
      if (competition) {
        setCompetition({
          ...competition,
          name: formData.name,
          description: formData.description,
          is_global: formData.scope === 'global',
          max_teams: formData.max_teams,
          max_members_per_team: formData.max_members_per_team,
        });
      }
      setSuccess('Competition updated successfully');
      setTimeout(() => {
        navigate('/headteacher/competitions', { 
          state: { successMessage: 'Competition updated successfully', refresh: Date.now() } 
        });
      }, 1000);
    } catch (err: any) {
      setError('Failed to update competition');
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/headteacher/competitions/${competitionId}`);
      setSuccess('Competition deleted successfully');
      setShowDeleteDialog(false);
      setTimeout(() => {
        navigate('/headteacher/competitions', { state: { successMessage: 'Competition deleted successfully' } });
      }, 1500);
    } catch (err: any) {
      setError('Failed to delete competition');
      setShowDeleteDialog(false);
    }
  };

  const handleOpenCreateTeamDialog = async () => {
    try {
      const teamsResponse = await apiClient.get(`/student/competitions/${competitionId}/my-team`);
      if (teamsResponse.data) {
        setError('Already in a team for this competition');
        return;
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error checking team membership:', err);
      }
    }
    setShowCreateTeamDialog(true);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(`/student/competitions/${competitionId}/teams`, {
        name: teamName
      });
      setShowCreateTeamDialog(false);
      setTeamName('');
      if (response.data.id) {
        navigate(`/teams/${response.data.id}`, { state: { successMessage: 'Team created successfully' } });
      } else {
        setSuccess('Team created successfully');
        await loadCompetition();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team');
      setShowCreateTeamDialog(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !competition) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Link to={isHeadteacher ? "/headteacher/competitions" : "/competitions"} style={{ textDecoration: 'none' }}>
            <MuiButton variant="outlined">Back to Competitions</MuiButton>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={isHeadteacher ? "/headteacher/competitions" : "/competitions"} style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Competitions
          </MuiButton>
        </Link>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isHeadteacher && (
            <>
              <Button onClick={() => setShowEditDialog(true)}>
                Edit
              </Button>
              <MuiButton 
                variant="outlined"
                color="error"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </MuiButton>
            </>
          )}
          <MuiButton 
            data-testid="logout" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            variant="outlined"
          >
            Logout
          </MuiButton>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} role="alert" onClose={() => setSuccess('')}>{success}</Alert>}
      
      <Typography variant="h4" component="h2" gutterBottom>
        {competition?.name}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Competition Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {competition?.description || 'No description'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Scope
            </Typography>
            <Typography variant="body1">
              {competition?.is_global ? 'Global' : 'School Only'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Max Teams
            </Typography>
            <Typography variant="body1" data-testid="max-teams">
              {competition?.max_teams}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Max Members Per Team
            </Typography>
            <Typography variant="body1" data-testid="max-members">
              {competition?.max_members_per_team}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {!isHeadteacher && (
        <>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button size="large" onClick={handleOpenCreateTeamDialog}>Create Team</Button>
          </Box>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Teams
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }} data-testid="teams-remaining">
                ({competition?.teams?.length || 0}/{competition?.max_teams} teams)
              </Typography>
            </Typography>
            {competition?.teams && competition.teams.length > 0 ? (
              <Grid container spacing={2}>
                {competition.teams.map((team) => (
                  <Grid item xs={12} sm={6} md={4} key={team.id}>
                    <Card>
                      <CardContent>
                        <Link to={`/teams/${team.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Typography variant="h6" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                            {team.name}
                          </Typography>
                        </Link>
                        <Typography variant="body2" color="text.secondary" data-testid="member-count">
                          Members: {team.members?.length || 0}/{competition.max_members_per_team}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">No teams yet</Typography>
            )}
          </Paper>
        </>
      )}

      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Competition</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEdit} id="edit-competition-form" sx={{ mt: 2 }}>
            <Input
              name="name"
              label="Competition Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              name="description"
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
            />
            <Input
              name="maxTeams"
              label="Max Teams"
              type="number"
              value={formData.max_teams}
              onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) || 10 })}
              inputProps={{ min: 1 }}
              required
            />
            <Input
              name="maxMembers"
              label="Max Members Per Team"
              type="number"
              value={formData.max_members_per_team}
              onChange={(e) => setFormData({ ...formData, max_members_per_team: parseInt(e.target.value) || 4 })}
              inputProps={{ min: 1 }}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Scope</InputLabel>
              <Select
                name="scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                label="Scope"
              >
                <MenuItem value="school">School Only</MenuItem>
                <MenuItem value="global">Global</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowEditDialog(false)}>Cancel</MuiButton>
          <Button type="submit" form="edit-competition-form">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this competition? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowDeleteDialog(false)}>Cancel</MuiButton>
          <MuiButton color="error" onClick={handleDelete}>
            Confirm
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={showCreateTeamDialog} onClose={() => setShowCreateTeamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Team</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateTeam} id="create-team-form" sx={{ pt: 1 }}>
            <Input
              name="name"
              label="Team Name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowCreateTeamDialog(false)}>Cancel</MuiButton>
          <Button type="submit" form="create-team-form">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompetitionDetails;
