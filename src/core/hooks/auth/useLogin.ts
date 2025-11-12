import { useState } from 'react';
import apiClient from '@core/api/apiClient';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: string;
    // Add other user properties as needed
  };
}

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token); // Store token
      // Optionally store user info
      // localStorage.setItem('currentUser', JSON.stringify(user));
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
};

export default useLogin;
