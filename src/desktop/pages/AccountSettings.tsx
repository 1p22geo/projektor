import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button as MuiButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';
import apiClient from '@core/api/apiClient';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirmPassword) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await apiClient.delete('/users/me', {
        data: { password: confirmPassword }
      });
      
      setSuccess('Account deleted successfully');
      setShowDeleteDialog(false);
      
      setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <MuiButton 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Back
        </MuiButton>
      </Box>

      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} role="alert">{success}</Alert>}

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom color="error">
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Once you delete your account, there is no going back. Please be certain.
        </Typography>
        <MuiButton 
          variant="outlined" 
          color="error"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Account
        </MuiButton>
      </Paper>

      <Dialog open={showDeleteDialog} onClose={() => !deleting && setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            All your data, including teams and collaborations, will be permanently removed.
          </Typography>
          <Input
            name="confirmPassword"
            label="Enter your password to confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={deleting}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
            Cancel
          </MuiButton>
          <Button 
            onClick={handleDeleteAccount}
            disabled={deleting || !confirmPassword}
          >
            {deleting ? 'Deleting...' : 'Confirm Deletion'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountSettings;
