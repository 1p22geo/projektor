import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Box, Button as MuiButton } from '@mui/material';
import { School as SchoolIcon, People as PeopleIcon, Logout as LogoutIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1">
          Admin Dashboard
        </Typography>
        <MuiButton 
          data-testid="logout" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          variant="outlined"
        >
          Logout
        </MuiButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">School Management</Typography>
              </Box>
              <Typography color="text.secondary">
                Manage verified schools, create new ones, or update existing school details.
              </Typography>
            </CardContent>
            <CardActions>
              <Link to="/admin/schools" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button>Schools</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">User Management</Typography>
              </Box>
              <Typography color="text.secondary">
                Oversee all user accounts, reset passwords, or delete users.
              </Typography>
            </CardContent>
            <CardActions>
              <Link to="/admin/users" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button>Users</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
