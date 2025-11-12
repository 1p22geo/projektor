import { useState } from 'react';
import apiClient from '@core/api/apiClient';

const useHandleJoinRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRequest = async (teamId: string, requestId: string, action: 'approve' | 'reject'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.put(`/teams/${teamId}/join-requests/${requestId}`, { action });
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} join request`);
      setLoading(false);
      return false;
    }
  };

  return { handleJoinRequest, loading, error };
};

export default useHandleJoinRequest;
