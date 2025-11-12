import useSWR, { mutate } from 'swr';
import apiClient from '@core/api/apiClient';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HEADTEACHER' | 'STUDENT';
  school?: string; // Optional reference to school ID
}

export const useUsers = () => {
  const { data, error } = useSWR<User[]>('/admin/users', apiClient.get);
  return {
    users: data,
    loading: !error && !data,
    error,
  };
};

export const useResetPassword = () => {
  const resetPassword = async (userId: string) => {
    const response = await apiClient.put(`/admin/users/${userId}/reset-password`);
    // No revalidation needed for a password reset, but could update local user state if desired
    return response.data;
  };
  return { resetPassword };
};

// Add other user management hooks (e.g., useDeleteUser) as needed
