import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button as PaperButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Input from '@platform/components/Input';
import Button from '@platform/components/Button';

const Register: React.FC = () => {
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    console.log('Register attempt with token:', token, 'name:', name, 'email:', email, 'password:', password);
    navigation.navigate('Login' as never);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Student Registration
          </Text>
          <Input
            label="Registration Token"
            type="text"
            placeholder="Token from your school"
            value={token}
            onChangeText={setToken}
          />
          <Input
            label="Full Name"
            type="text"
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
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
            placeholder="Choose a Password"
            value={password}
            onChangeText={setPassword}
          />
          <Button onPress={handleSubmit}>Register</Button>
          <PaperButton 
            mode="text" 
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.link}
          >
            Already have an account? Login
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
  link: {
    marginTop: 16,
  },
});

export default Register;
