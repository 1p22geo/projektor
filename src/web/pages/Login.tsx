import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';
import useLogin from '@core/hooks/auth/useLogin';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, error, loading } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result) {
      if (result.user.role === 'headteacher') {
        navigate('/dashboard');
      } else if (result.user.role === 'student') {
        navigate('/competitions');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            name="password"
            label="Password"
            type="password"
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Need an account? Register
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
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link to="/admin/login" style={{ textDecoration: 'none', color: '#666' }}>
            Admin Login
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
