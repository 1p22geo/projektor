import useSWR from 'swr';
import apiClient from '@core/api/apiClient';

interface Competition {
  _id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  maxTeams: number;
  maxMembersPerTeam: number;
}

const useGetCompetitions = () => {
  const { data, error } = useSWR<Competition[]>('/competitions', apiClient.get);
  return {
    competitions: data,
    loading: !error && !data,
    error,
  };
};

export default useGetCompetitions;
