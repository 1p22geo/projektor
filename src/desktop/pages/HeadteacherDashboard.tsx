import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert
} from '@mui/material';
import { EmojiEvents as TrophyIcon, Gavel as ModerationIcon, ContentCopy, Download } from '@mui/icons-material';
import Button from '@platform/components/Button';
import Input from '@platform/components/Input';
import apiClient from '@core/api/apiClient';

const HeadteacherDashboard: React.FC = () => {
  const [tokenCount, setTokenCount] = useState(1);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    
    try {
      const response = await apiClient.post('/headteacher/tokens', {
        count: parseInt(tokenCount.toString())
      });
      
      setGeneratedTokens(response.data.tokens);
      setSuccess('Tokens generated successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate tokens');
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setSuccess('Token copied to clipboard');
  };

  const downloadTokens = () => {
    const csv = 'Token\n' + generatedTokens.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokens_${Date.now()}.csv`;
    a.click();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} role="alert">{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Tokens
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
          <Input
            name="count"
            label="Number of Tokens"
            type="number"
            value={tokenCount}
            onChange={(e) => setTokenCount(parseInt(e.target.value) || 1)}
            required
          />
          <Button onClick={handleGenerate}>Generate</Button>
        </Box>
        {generatedTokens.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Generated Tokens:</Typography>
              <Button onClick={downloadTokens}>Download CSV</Button>
            </Box>
            <List>
              {generatedTokens.map((token, index) => (
                <ListItem key={index} secondaryAction={
                  <IconButton data-testid="copy-token" onClick={() => copyToken(token)}>
                    <ContentCopy />
                  </IconButton>
                }>
                  <ListItemText primary={<span data-testid="token">{token}</span>} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrophyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Competitions</Typography>
              </Box>
              <Typography color="text.secondary">
                Create and manage competitions for your school.
              </Typography>
            </CardContent>
            <CardActions>
              <Link to="/headteacher/competitions" style={{ textDecoration: 'none' }}>
                <Button>Manage Competitions</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ModerationIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Team Moderation</Typography>
              </Box>
              <Typography color="text.secondary">
                Monitor teams, view chats, and manage members.
              </Typography>
            </CardContent>
            <CardActions>
              <Link to="/headteacher/moderation" style={{ textDecoration: 'none' }}>
                <Button>View Teams</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HeadteacherDashboard;
