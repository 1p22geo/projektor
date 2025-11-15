import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, Box } from '@mui/material';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';

const Register: React.FC = () => {
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to register student
    console.log('Register attempt with token:', token, 'name:', name, 'email:', email, 'password:', password);
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Student Registration
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Input
            label="Registration Token"
            type="text"
            placeholder="Token from your school"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <Input
            label="Full Name"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Choose a Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Already have an account? Login
            </Link>
            <Button type="submit">Register</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
