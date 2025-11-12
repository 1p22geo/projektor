import { useState } from 'react';
import apiClient from '@core/api/apiClient';

const useRequestToJoinTeam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestToJoinTeam = async (teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/teams/${teamId}/join-requests`);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send join request');
      setLoading(false);
      return false;
    }
  };

  return { requestToJoinTeam, loading, error };
};

export default useRequestToJoinTeam;
