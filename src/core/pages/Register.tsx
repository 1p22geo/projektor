import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import Input from '@core/components/Input';
import Button from '@core/components/Button';
import useRegisterStudent from '@core/hooks/auth/useRegisterStudent'; // Will be implemented in T024
import Layout from '@core/components/Layout';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const { register, error, loading } = useRegisterStudent(); // Uncomment when T024 is done

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({ token, name, email, password }); // Uncomment when T024 is done
    if (success) {
      navigate('/login'); // Redirect to login page
    }
  };

  return (
    <Layout title="Register">
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Input
              name="name"
              label="Name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Input
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Input
              name="token"
              label="Registration Token"
              type="text"
              placeholder="Enter your registration token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Already have an account? Login
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
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

export default Register;
