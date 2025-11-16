import { useState } from 'react';
import axiosInstance from '@core/api';

interface RegisterStudentData {
  token: string;
  name: string;
  email: string;
  password: string;
}

export const useRegisterStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (registerData: RegisterStudentData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/api/auth/register/student', registerData);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  return { register, loading, error };
};