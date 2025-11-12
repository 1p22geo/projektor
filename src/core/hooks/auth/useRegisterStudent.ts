import { useState } from 'react';
import apiClient from '@core/api/apiClient';

const useRegisterStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (token: string, name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/register/student', { token, name, email, password });
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  return { register, loading, error };
};

export default useRegisterStudent;
