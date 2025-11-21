import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Tabs, Tab, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import Button from '@core/components/Button';
import Layout from '@core/components/Layout';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@core/hooks/useApi';
import axios from 'axios';

interface TeamMember {
  user_id: string;
  email: string;
  name: string;
}

interface ChatMessage {
  _id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface TeamFile {
  _id: string;
  filename: string;
  url: string;
  size: number;
  user_id: string;
  user_name: string;
  created_at: string;
}

interface Team {
  _id: string;
  name: string;
  members: TeamMember[];
}

const TeamModeration: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({ open: false, type: '', id: '', name: '' });

  const { data: team, error: teamError, isLoading: teamLoading } = useSWR<Team>(teamId ? `/headteacher/teams/${teamId}` : null, fetcher);
  const { data: messages } = useSWR<ChatMessage[]>(teamId && tab === 1 ? `/headteacher/teams/${teamId}/chat` : null, fetcher);
  const { data: files } = useSWR<TeamFile[]>(teamId && tab === 2 ? `/headteacher/teams/${teamId}/files` : null, fetcher);

  const handleRemoveMember = async (userId: string) => {
    try {
      await axios.delete(`/api/headteacher/teams/${teamId}/members/${userId}`);
      mutate(`/headteacher/teams/${teamId}`);
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
    } catch (error) {
      console.error('Failed to remove member', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`/api/headteacher/teams/${teamId}/messages/${messageId}`);
      mutate(`/headteacher/teams/${teamId}/chat`);
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
    } catch (error) {
      console.error('Failed to delete message', error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/headteacher/teams/${teamId}/files/${fileId}`);
      mutate(`/headteacher/teams/${teamId}/files`);
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
    } catch (error) {
      console.error('Failed to delete file', error);
    }
  };

  const handleDownloadFile = async (fileUrl: string, filename: string) => {
    try {
      const response = await axios.get(`/api${fileUrl}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download file', error);
    }
  };

  if (teamLoading) {
    return (
      <Layout title="Team Moderation">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (teamError || !team) {
    return (
      <Layout title="Team Moderation">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Failed to load team</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title={`Moderation: ${team.name}`}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Button onClick={() => navigate('/moderation')}>← Back to Moderation</Button>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          {team.name}
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Members" />
          <Tab label="Chat" />
          <Tab label="Files" />
          <Tab label="Join Requests" />
        </Tabs>

        {tab === 0 && (
          <Box data-testid="team-members">
            <List>
              {team.members?.map((member: TeamMember) => (
                <ListItem
                  key={member.user_id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      data-testid={`remove-member-${member.email}`}
                      onClick={() => setDeleteDialog({ open: true, type: 'member', id: member.user_id, name: member.email })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={member.name || member.email} secondary={member.email} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 1 && (
          <Box data-testid="chat-messages">
            <List>
              {messages?.map((msg: ChatMessage) => (
                <ListItem
                  key={msg._id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      data-testid={`delete-message-${msg._id}`}
                      onClick={() => setDeleteDialog({ open: true, type: 'message', id: msg._id, name: msg.message.substring(0, 50) })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={msg.message}
                    secondary={`${msg.user_name || 'Unknown'} - ${new Date(msg.created_at).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 2 && (
          <Box data-testid="files-list">
            <List>
              {files?.map((file: TeamFile) => (
                <ListItem
                  key={file._id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        data-testid={`download-${file.filename}`}
                        onClick={() => handleDownloadFile(file.url, file.filename)}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        data-testid={`delete-file-${file.filename}`}
                        onClick={() => setDeleteDialog({ open: true, type: 'file', id: file._id, name: file.filename })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={file.filename}
                    secondary={`${(file.size / 1024).toFixed(2)} KB - ${file.user_name || 'Unknown'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 3 && (
          <Box data-testid="join-requests">
            <Alert severity="info">No pending join requests</Alert>
          </Box>
        )}

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', id: '', name: '' })}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this {deleteDialog.type}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, type: '', id: '', name: '' })}>Cancel</Button>
            <Button
              onClick={() => {
                if (deleteDialog.type === 'member') handleRemoveMember(deleteDialog.id);
                else if (deleteDialog.type === 'message') handleDeleteMessage(deleteDialog.id);
                else if (deleteDialog.type === 'file') handleDeleteFile(deleteDialog.id);
              }}
              color="error"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default TeamModeration;
