import { useState } from 'react';
import axiosInstance from '@core/api';
import { useJoinRequests } from './useJoinRequests'; // To revalidate the join requests list

export const useHandleJoinRequest = (teamId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useJoinRequests(teamId);

  const handleRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.put(`/api/teams/${teamId}/join-requests/${requestId}`, { status });
      mutate(); // Revalidate the join requests list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${status.toLowerCase()} join request`);
      setLoading(false);
      return false;
    }
  };

  return { handleRequest, loading, error };
};