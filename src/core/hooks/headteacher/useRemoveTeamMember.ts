import { useState } from 'react';
import apiClient from '@core/api/apiClient';
// Assuming there's a useTeams hook for headteacher to revalidate the teams list
// import { useTeamsForModeration } from './useTeamsForModeration'; 

export const useRemoveTeamMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { mutate } = useTeamsForModeration(); // Uncomment when useTeamsForModeration is implemented

  const removeTeamMember = async (teamId: string, memberId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/headteacher/teams/${teamId}/members/${memberId}`);
      // mutate(); // Revalidate the teams list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove team member');
      setLoading(false);
      return false;
    }
  };

  return { removeTeamMember, loading, error };
};