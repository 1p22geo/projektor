import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button as MuiButton, 
  Box,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
  const { schoolId } = useParams<{ schoolId: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  const loadSchool = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/schools/${schoolId}`);
      setSchool(response.data);
    } catch (err: any) {
      setError('Failed to load school');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !school) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'School not found'}</Alert>
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
      <Box sx={{ mb: 3 }}>
        <Link to="/admin/schools" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Schools
          </MuiButton>
        </Link>
      </Box>
      
      <Typography variant="h4" component="h2" gutterBottom>
        {school.name}
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
              {school.name}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {school.email}
            </Typography>
          </Grid>
          
          {school.headteacher && (
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
    </Container>
  );
};

export default SchoolDetails;
