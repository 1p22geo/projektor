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
  InputLabel
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
}

const CompetitionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams<{ competitionId: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'school',
    max_teams: 10,
    max_members_per_team: 4,
  });

  useEffect(() => {
    loadCompetition();
  }, [competitionId]);

  const loadCompetition = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/headteacher/competitions/${competitionId}`);
      setCompetition(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description,
        scope: response.data.is_global ? 'global' : 'school',
        max_teams: response.data.max_teams,
        max_members_per_team: response.data.max_members_per_team,
      });
    } catch (err: any) {
      setError('Failed to load competition');
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
      setSuccess('Competition updated successfully');
      setShowEditDialog(false);
      loadCompetition();
    } catch (err: any) {
      setError('Failed to update competition');
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
          <Link to="/headteacher/competitions" style={{ textDecoration: 'none' }}>
            <MuiButton variant="outlined">Back to Competitions</MuiButton>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/headteacher/competitions" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Competitions
          </MuiButton>
        </Link>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={() => setShowEditDialog(true)}>
            Edit
          </Button>
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
    </Container>
  );
};

export default CompetitionDetails;
