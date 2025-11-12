import { useState } from 'react';
import apiClient from '@core/api/apiClient';
import { mutate } from 'swr';

const useRemoveTeamMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeTeamMember = async (teamId: string, memberId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/headteacher/teams/${teamId}/members/${memberId}`);
      // Optionally revalidate team data if needed
      mutate(`/headteacher/teams/${teamId}/members`);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove team member');
      setLoading(false);
      return false;
    }
  };

  return { removeTeamMember, loading, error };
};

export default useRemoveTeamMember;
