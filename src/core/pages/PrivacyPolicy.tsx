import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Layout from '@core/components/Layout';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout title="Privacy Policy">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          This Privacy Policy describes how ProjektOR collects, uses, and discloses your personal information when you use our application.
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information you provide directly to us when you create an account, use the chat features, upload files, or otherwise interact with the application. This may include:
        </Typography>
        <List sx={{ listStyleType: 'disc', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="**Account Information:** Your name, email address, password (hashed), and role (student, headteacher, admin)." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="**School Information:** If you are a headteacher, information about your school." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="**Content Information:** Messages you send in chat rooms and files you upload to teams." />
          </ListItem>
        </List>
        <Typography variant="h5" component="h2" gutterBottom>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information we collect to:
        </Typography>
        <List sx={{ listStyleType: 'disc', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Provide, maintain, and improve our services." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Facilitate communication and collaboration within teams." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Personalize your experience." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Monitor and analyze trends, usage, and activities in connection with our services." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Detect, investigate, and prevent fraudulent transactions and other illegal activities." />
          </ListItem>
        </List>
        <Typography variant="h5" component="h2" gutterBottom>
          Information Sharing
        </Typography>
        <Typography variant="body1" paragraph>
          We do not share your personal information with third parties except as described in this policy or with your consent. We may share information with:
        </Typography>
        <List sx={{ listStyleType: 'disc', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="**Service Providers:** Third-party vendors, consultants, and other service providers who need access to your information to carry out work on our behalf." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="**Legal Compliance:** In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process." />
          </ListItem>
        </List>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Choices
        </Typography>
        <Typography variant="body1" paragraph>
          You have certain choices regarding your personal information:
        </Typography>
        <List sx={{ listStyleType: 'disc', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="**Account Information:** You may update, correct, or delete information about yourself at any time by logging into your online account or emailing us at [your email address]." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="**Cookies:** Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies." />
          </ListItem>
        </List>
        <Typography variant="h5" component="h2" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at [your email address].
        </Typography>
      </Container>
    </Layout>
  );
};

export default PrivacyPolicy;
