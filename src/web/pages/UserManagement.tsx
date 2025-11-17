import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, MoreVert as MoreVertIcon, Logout as LogoutIcon, Download as DownloadIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import apiClient from '@core/api/apiClient';
import { useExportUserData } from '@core/hooks/admin/useExportUserData';
import { useDeleteUserData } from '@core/hooks/admin/useDeleteUserData';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  school_id?: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    console.log(selectedUser);

    try {
      const response = await apiClient.put(`/admin/users/${selectedUser._id}/reset-password`);
      setNewPassword(response.data.new_password);
      setShowPasswordDialog(true);
      setSuccess('Password reset successfully');
      handleMenuClose();
    } catch (err: any) {
      setError('Failed to reset password');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.delete(`/admin/users/${selectedUser._id}`);
      setSuccess('User deleted successfully');
      setShowDeleteDialog(false);
      handleMenuClose();
      loadUsers();
    } catch (err: any) {
      setError('Failed to delete user');
    }
  };

  const handleExportData = async () => {
    if (!selectedUser) return;

    const data = await exportUserData(selectedUser._id);
    if (data) {
      setExportedData(JSON.stringify(data, null, 2));
      setShowExportDialog(true);
      setSuccess('User data exported successfully');
      handleMenuClose();
    } else if (exportError) {
      setError(exportError);
    }
  };

  const handleDeleteAllUserData = async () => {
    if (!selectedUser) return;

    const success = await deleteUserData(selectedUser._id);
    if (success) {
      setSuccess('All user data deleted successfully');
      setShowDeleteDialog(false); // Close the regular delete dialog if open
      handleMenuClose();
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
          <MuiButton startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Dashboard
          </MuiButton>
        </Link>
        <MuiButton
          data-testid="logout"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          variant="outlined"
        >
          Logout
        </MuiButton>
      </Box>

      <Typography variant="h4" component="h2" gutterBottom>
        Users
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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell data-testid="user-name">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      data-testid="user-actions"
                      onClick={(e) => handleMenuClick(e, user)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleResetPassword}>Reset Password</MenuItem>
        <MenuItem onClick={handleExportData} disabled={exportLoading}>
          {exportLoading ? 'Exporting...' : 'Export Data'}
        </MenuItem>
        <MenuItem onClick={() => { setShowDeleteDialog(true); handleMenuClose(); }}>Delete User Account</MenuItem>
        <MenuItem onClick={() => { setShowDeleteDialog(true); handleMenuClose(); }}>Delete All User Data</MenuItem>
      </Menu>

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
          <Button onClick={handleDeleteUser}>Delete User Account</Button>
          <Button onClick={handleDeleteAllUserData} color="error" disabled={deleteDataLoading}>
            {deleteDataLoading ? 'Deleting...' : 'Delete All User Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
