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
  DialogActions
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

const SchoolDetails: React.FC = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams<{ schoolId: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  const loadSchool = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/schools/${schoolId}`);
      setSchool(response.data);
      setEditedName(response.data.name);
    } catch (err: any) {
      setError('Failed to load school');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/admin/schools/${schoolId}`, { name: editedName });
      setSuccess('School updated successfully');
      setShowEditDialog(false);
      await loadSchool();
    } catch (err: any) {
      setError('Failed to update school');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !school) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Link to="/admin/schools" style={{ textDecoration: 'none' }}>
            <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
              Back to Schools
            </MuiButton>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/admin/schools" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Schools
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
        {school?.name}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              School Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              School Name
            </Typography>
            <Typography variant="body1">
              {school?.name}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {school?.email}
            </Typography>
          </Grid>
          
          {school?.headteacher && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Headteacher Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {school.headteacher.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {school.headteacher.email}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit School</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEdit} id="edit-school-form" sx={{ pt: 1 }}>
            <Input
              name="name"
              label="School Name"
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowEditDialog(false)}>Cancel</MuiButton>
          <Button type="submit" form="edit-school-form">Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SchoolDetails;
