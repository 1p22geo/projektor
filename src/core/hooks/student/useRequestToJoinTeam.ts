import { useState } from 'react';
import apiClient from '@core/api/apiClient';

export const useRequestToJoinTeam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestToJoin = async (teamId: string): Promise<{ success: boolean; requestId?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/student/teams/${teamId}/join-requests`);
      setLoading(false);
      return { success: true, requestId: response.data?.id };
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send join request');
      setLoading(false);
      return { success: false };
    }
  };

  return { requestToJoin, loading, error };
};