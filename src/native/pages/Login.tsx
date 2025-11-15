import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button as PaperButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';
import useLogin from '@core/hooks/auth/useLogin';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { login, error, loading } = useLogin();

  const handleSubmit = async () => {
    const result = await login(email, password);
    if (result) {
      if (result.user.role === 'HEADTEACHER') {
        navigation.navigate('Competitions' as never);
      } else if (result.user.role === 'STUDENT') {
        navigation.navigate('Competitions' as never);
      } else {
        navigation.navigate('Competitions' as never);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Login
          </Text>
          <Input
            label="Email"
            type="email"
            placeholder="Your Email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your Password"
            value={password}
            onChangeText={setPassword}
          />
          {error && (
            <Text style={styles.error}>{error}</Text>
          )}
          <Button onPress={handleSubmit} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <PaperButton 
            mode="text" 
            onPress={() => navigation.navigate('Register' as never)}
            style={styles.link}
          >
            Need an account? Register
          </PaperButton>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    color: '#d32f2f',
    marginTop: 8,
    marginBottom: 8,
  },
  link: {
    marginTop: 16,
  },
});

export default Login;
