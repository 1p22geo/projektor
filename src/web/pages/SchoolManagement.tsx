import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import Input from '@platform/components/Input';

interface School {
  _id: string;
  name: string;
  headteacher?: {
    _id: string;
    name: string;
    email: string;
  };
}

const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [headteacherEmail, setHeadteacherEmail] = useState('');
  const [headteacherName, setHeadteacherName] = useState('');

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create school
    console.log('Creating school:', { newSchoolName, headteacherEmail, headteacherName });
    setShowCreateForm(false);
    setNewSchoolName('');
    setHeadteacherEmail('');
    setHeadteacherName('');
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      // TODO: Call API to delete school
      console.log('Deleting school:', schoolId);
      setSchools(schools.filter(s => s._id !== schoolId));
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
      
      <Typography variant="h3" gutterBottom>
        School Management
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => setShowCreateForm(true)}>
          Create New School
        </Button>
      </Box>

      <Dialog open={showCreateForm} onClose={() => setShowCreateForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New School</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateSchool} id="create-school-form">
            <Input
              label="School Name"
              type="text"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              required
            />
            <Input
              label="Headteacher Name"
              type="text"
              value={headteacherName}
              onChange={(e) => setHeadteacherName(e.target.value)}
              required
            />
            <Input
              label="Headteacher Email"
              type="email"
              value={headteacherEmail}
              onChange={(e) => setHeadteacherEmail(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowCreateForm(false)}>Cancel</MuiButton>
          <Button type="submit" form="create-school-form">Create School</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>School Name</TableCell>
              <TableCell>Headteacher</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No schools found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school._id}>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>
                    {school.headteacher ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {school.headteacher.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {school.headteacher.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No headteacher assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteSchool(school._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default SchoolManagement;
