import { useState } from 'react';
import apiClient from '@core/api/apiClient';

interface LoginResult {
  user: {
    id: string;
    role: string;
    email: string;
  };
}

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<LoginResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      return { user };
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      setLoading(false);
      return null;
    }
  };

  return { login, loading, error };
};

export default useLogin;