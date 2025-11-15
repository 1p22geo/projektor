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
  ListItemText
} from '@mui/material';
import { EmojiEvents as TrophyIcon, Gavel as ModerationIcon } from '@mui/icons-material';
import Button from '@platform/components/Button';
import Input from '@platform/components/Input';

const HeadteacherDashboard: React.FC = () => {
  const [tokenCount, setTokenCount] = useState(1);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);

  const handleGenerate = async () => {
    // TODO: Call API to generate tokens
    console.log(`Generating ${tokenCount} tokens...`);
    setGeneratedTokens(['TOKEN123', 'TOKEN456', 'TOKEN789']);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Headteacher Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Generate Student Registration Tokens
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <Input
            label="Number of Tokens"
            type="number"
            value={tokenCount}
            onChange={(e) => setTokenCount(parseInt(e.target.value))}
            min="1"
            max="100"
            required
          />
          <Button onClick={handleGenerate}>Generate Tokens</Button>
        </Box>
        {generatedTokens.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Generated Tokens:</Typography>
            <List>
              {generatedTokens.map((token, index) => (
                <ListItem key={index}>
                  <ListItemText primary={token} />
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
                <Typography variant="h5">Competition Management</Typography>
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
