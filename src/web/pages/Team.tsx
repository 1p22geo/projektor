import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Tabs, Tab } from '@mui/material';
import Button from '@platform/components/Button';
import Chat from '@platform/components/Chat';
import Files from '@platform/components/Files';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TeamPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [tabValue, setTabValue] = React.useState(0);

  const handleJoinRequest = async () => {
    if (!teamId) {
      console.error('Team ID is missing');
      return;
    }
    console.log(`Requesting to join team ${teamId}`);
    alert('Join request sent!');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Team: {teamId}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Team Details and Collaboration
      </Typography>

      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Join Request
        </Typography>
        <Typography color="text.secondary" paragraph>
          Send a request to join this team.
        </Typography>
        <Button onClick={handleJoinRequest}>Request to Join</Button>
      </Paper>

      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pending Join Requests
        </Typography>
        <Typography color="text.secondary">
          No pending requests.
        </Typography>
      </Paper>

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="team tabs">
            <Tab label="Team Chat" id="team-tab-0" aria-controls="team-tabpanel-0" />
            <Tab label="Team Files" id="team-tab-1" aria-controls="team-tabpanel-1" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {teamId && <Chat teamId={teamId} />}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {teamId && <Files teamId={teamId} />}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TeamPage;
