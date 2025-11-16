import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Button from '@core/components/Button';
import apiClient from '@core/api/apiClient';
import { useExportUserData } from '@core/hooks/admin/useExportUserData';
import { useDeleteUserData } from '@core/hooks/admin/useDeleteUserData';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HEADTEACHER' | 'STUDENT';
  school_id?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedData, setExportedData] = useState<string>('');

  const { exportUserData, loading: exportLoading, error: exportError } = useExportUserData();
  const { deleteUserData, loading: deleteDataLoading, error: deleteDataError } = useDeleteUserData();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
    } catch (err: any) {
      setError('Failed to load users');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/reset-password`);
      setNewPassword(response.data.new_password);
      setShowPasswordDialog(true);
      setSuccess('Password reset successfully.');
    } catch (err: any) {
      setError('Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      setShowDeleteDialog(false);
      loadUsers();
    } catch (err: any) {
      setError('Failed to delete user');
    }
  };

  const handleExportData = async (userId: string) => {
    const data = await exportUserData(userId);
    if (data) {
      setExportedData(JSON.stringify(data, null, 2));
      setShowExportDialog(true);
      setSuccess('User data exported successfully');
    } else if (exportError) {
      setError(exportError);
    }
  };

  const handleDeleteAllUserData = async (userId: string) => {
    const success = await deleteUserData(userId);
    if (success) {
      setSuccess('All user data deleted successfully');
      setShowDeleteDialog(false);
      loadUsers();
    } else if (deleteDataError) {
      setError(deleteDataError);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'secondary';
      case 'headteacher': return 'primary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Dashboard
          </MuiButton>
        </Link>
      </Box>
      
      <Typography variant="h4" component="h2" gutterBottom>
        User Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} role="alert" onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small"
                      color={
                        user.role === 'ADMIN' ? 'secondary' :
                        user.role === 'HEADTEACHER' ? 'primary' :
                        'success'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {user.school_id ? user.school_id : '-'}
                  </TableCell>
                  <TableCell>
                    <MuiButton 
                      size="small" 
                      onClick={() => handleResetPassword(user.id)}
                      sx={{ mr: 1 }}
                    >
                      Reset Password
                    </MuiButton>
                    <MuiButton 
                      size="small" 
                      onClick={() => handleExportData(user.id)}
                      sx={{ mr: 1 }}
                      disabled={exportLoading}
                    >
                      {exportLoading ? 'Exporting...' : 'Export Data'}
                    </MuiButton>
                    <MuiButton 
                      size="small" 
                      color="error"
                      onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}
                      sx={{ mr: 1 }}
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

      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
        <DialogTitle>Password Reset Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            New password: <strong data-testid="new-password">{newPassword}</strong>
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Please save this password and provide it to the user.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowPasswordDialog(false)}>Close</MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Exported User Data</DialogTitle>
        <DialogContent>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{exportedData}</pre>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowExportDialog(false)}>Close</MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowDeleteDialog(false)}>Cancel</MuiButton>
          <Button onClick={() => handleDeleteUser(selectedUser?.id || '')}>Delete User Account</Button>
          <Button onClick={() => handleDeleteAllUserData(selectedUser?.id || '')} color="error" disabled={deleteDataLoading}>
            {deleteDataLoading ? 'Deleting...' : 'Delete All User Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
