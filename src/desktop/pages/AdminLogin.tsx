import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import Input from '@core/components/Input';
import Button from '@core/components/Button';
import useLoginAdmin from '@core/hooks/auth/useLoginAdmin';
import Layout from '@core/components/Layout';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, error, loading } = useLoginAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <Layout title="Admin Login">
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Admin Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Input
              name="password"
              label="Password"
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                ← Back to Login
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default AdminLogin;