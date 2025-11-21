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
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import Input from '@platform/components/Input';
import apiClient from '@core/api/apiClient';

interface School {
  id: string;
  name: string;
  email: string;
  headteacher_id?: string;
  headteacher?: {
    id: string;
    name: string;
    email: string;
  };
}

const SchoolManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [schools, setSchools] = useState<School[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSchools();
  }, [location]);

  const loadSchools = async () => {
    try {
      const response = await apiClient.get('/admin/schools');
      setSchools(response.data);
      setError('');  // Clear any previous errors
    } catch (err: any) {
      setError('Failed to load schools');
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGeneratedPassword('');
    
    try {
      const response = await apiClient.post('/admin/schools', {
        name: newSchoolName,
        email: schoolEmail
      });
      
      // Ensure state updates happen
      const password = response.data.generated_password;
      if (password) {
        setGeneratedPassword(password);
        setSuccess('School created successfully');
        setNewSchoolName('');
        setSchoolEmail('');
        await loadSchools();
      } else {
        setError('School created but no password returned');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create school');
    }
  };
  
  const handleCloseCreateDialog = () => {
    setShowCreateForm(false);
    setGeneratedPassword('');
    setSuccess('');
    setError('');
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        await apiClient.delete(`/admin/schools/${schoolId}`);
        loadSchools();
      } catch (err: any) {
        setError('Failed to delete school');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
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
        Schools
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => setShowCreateForm(true)}>
          Create School
        </Button>
      </Box>

      <Dialog open={showCreateForm} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSchool}>
          <DialogTitle>Create New School</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {generatedPassword && success && (
              <Alert severity="success" sx={{ mb: 2, mt: 1 }} role="alert">
                School created successfully! Headteacher password: <strong data-testid="generated-password">{generatedPassword}</strong>
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2, mt: 1 }} role="alert">
                {error}
              </Alert>
            )}
            <Input
              name="name"
              label="School Name"
              type="text"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              required
              disabled={!!generatedPassword}
            />
            <Input
              name="email"
              label="School Email"
              type="email"
              value={schoolEmail}
              onChange={(e) => setSchoolEmail(e.target.value)}
              required
              disabled={!!generatedPassword}
            />
          </DialogContent>
          <DialogActions>
            {generatedPassword ? (
              <MuiButton type="button" onClick={handleCloseCreateDialog}>Close</MuiButton>
            ) : (
              <>
                <MuiButton type="button" onClick={handleCloseCreateDialog}>Cancel</MuiButton>
                <Button type="submit">Create</Button>
              </>
            )}
          </DialogActions>
        </form>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>School Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Headteacher</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No schools found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id} sx={{ cursor: 'pointer' }} hover>
                  <TableCell onClick={() => navigate(`/admin/schools/${school.id}`)}>
                    {school.name}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/schools/${school.id}`)}>
                    {school.email}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/schools/${school.id}`)}>
                    {school.headteacher ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {school.headteacher.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {school.headteacher.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No headteacher assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <MuiButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSchool(school.id);
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

export default SchoolManagement;
