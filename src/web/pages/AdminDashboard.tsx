import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Box } from '@mui/material';
import { School as SchoolIcon, People as PeopleIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Admin Dashboard
      </Typography>
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
              <Link to="/admin/schools" style={{ textDecoration: 'none' }}>
                <Button>Manage Schools</Button>
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
              <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                <Button>Manage Users</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
