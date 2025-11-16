import { useState } from 'react';
import axiosInstance from '@core/api';
import { useCompetitions } from './useCompetitions'; // To revalidate the competitions list

export const useDeleteCompetition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useCompetitions();

  const deleteCompetition = async (competitionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/api/headteacher/competitions/${competitionId}`);
      mutate(); // Revalidate the competitions list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete competition');
      setLoading(false);
      return false;
    }
  };

  return { deleteCompetition, loading, error };
};
