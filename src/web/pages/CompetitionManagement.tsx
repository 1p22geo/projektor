import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button as MuiButton, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
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

const CompetitionManagement: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'school',
    max_teams: 10,
    max_members_per_team: 4,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadCompetitions();
    // Check if there's a success message from navigation state
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.refresh]);

  const loadCompetitions = async () => {
    try {
      const response = await apiClient.get('/headteacher/competitions');
      setCompetitions(response.data || []);
    } catch (err: any) {
      setError('Failed to load competitions');
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/headteacher/competitions', {
        ...formData,
        is_global: formData.scope === 'global'
      });
      setSuccess('Competition created successfully');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        scope: 'school',
        max_teams: 10,
        max_members_per_team: 4,
      });
      loadCompetitions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create competition');
    }
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      try {
        await apiClient.delete(`/headteacher/competitions/${competitionId}`);
        setSuccess('Competition deleted successfully');
        loadCompetitions();
      } catch (err: any) {
        setError('Failed to delete competition');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Link to="/headteacher/dashboard" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Dashboard
          </MuiButton>
        </Link>
        <MuiButton 
          data-testid="logout" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          variant="outlined"
        >
          Logout
        </MuiButton>
      </Box>

      <Typography variant="h4" component="h2" gutterBottom>
        Competition Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} role="alert" onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ mb: 3 }}>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Competition
        </Button>
      </Box>

      <Dialog open={showCreateForm} onClose={() => setShowCreateForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Competition</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateCompetition} id="create-competition-form" sx={{ mt: 2 }}>
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
              <InputLabel id="scope-label">Scope</InputLabel>
              <Select
                labelId="scope-label"
                name="scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                label="Scope"
                data-testid="scope-select"
              >
                <MenuItem value="school">School only</MenuItem>
                <MenuItem value="global">Global</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowCreateForm(false)}>Cancel</MuiButton>
          <Button type="submit" form="create-competition-form">Create</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Max Teams</TableCell>
              <TableCell>Max Members</TableCell>
              <TableCell>Scope</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {competitions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No competitions found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              competitions.map((competition) => (
                <TableRow key={competition.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell onClick={() => navigate(`/headteacher/competitions/${competition.id}`)}>
                    {competition.name}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/headteacher/competitions/${competition.id}`)}>
                    {competition.description}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/headteacher/competitions/${competition.id}`)}>
                    {competition.max_teams}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/headteacher/competitions/${competition.id}`)}>
                    {competition.max_members_per_team}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/headteacher/competitions/${competition.id}`)}>
                    {competition.is_global ? (
                      <span data-testid="scope-global">Global</span>
                    ) : (
                      'School'
                    )}
                  </TableCell>
                  <TableCell>
                    <MuiButton 
                      size="small" 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCompetition(competition.id);
                      }}
                    >
                      Delete
                    </MuiButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CompetitionManagement;
