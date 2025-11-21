import React, { useState } from 'react';
import { View, StyleSheet, Alert as RNAlert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Button as PaperButton } from 'react-native-paper';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';
import apiClient from '@core/api/apiClient';

const AccountSettings: React.FC = () => {
  const navigation = useNavigation();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirmPassword) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    RNAlert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setError('');

            try {
              await apiClient.delete('/users/me', {
                data: { password: confirmPassword }
              });
              
              RNAlert.alert('Success', 'Account deleted successfully');
              
              // Clear auth
              // @ts-ignore
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err: any) {
              setError(err.response?.data?.detail || 'Failed to delete account');
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PaperButton mode="outlined" onPress={() => navigation.goBack()}>
          Back
        </PaperButton>
      </View>

      <Text variant="headlineMedium" style={styles.title}>
        Account Settings
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.dangerZone}>
        <Text variant="titleMedium" style={styles.dangerTitle}>
          Danger Zone
        </Text>
        <Text variant="bodyMedium" style={styles.dangerDescription}>
          Once you delete your account, there is no going back. Please be certain.
        </Text>
        
        <Input
          name="confirmPassword"
          label="Enter your password to confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={deleting}
        />

        <Button 
          onPress={handleDeleteAccount}
          disabled={deleting || !confirmPassword}
          style={styles.deleteButton}
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 24,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  dangerZone: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
  },
  dangerTitle: {
    color: '#f44336',
    marginBottom: 8,
  },
  dangerDescription: {
    marginBottom: 16,
    color: '#666',
  },
  deleteButton: {
    marginTop: 16,
  },
});

export default AccountSettings;
