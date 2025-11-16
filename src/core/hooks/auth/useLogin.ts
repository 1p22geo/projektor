import { useState } from 'react';
import axiosInstance from '@core/api'; // Assuming axiosInstance is configured for API calls

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
};

export default useLogin;