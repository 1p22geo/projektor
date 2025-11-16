import { useState } from 'react';
import axiosInstance from '@core/api';

export const useRequestToJoinTeam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestToJoin = async (teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post(`/api/teams/${teamId}/join-requests`);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send join request');
      setLoading(false);
      return false;
    }
  };

  return { requestToJoin, loading, error };
};