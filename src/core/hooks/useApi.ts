import useSWR, { SWRConfiguration } from 'swr';
import apiClient from '../api/apiClient';

interface UseApiOptions extends SWRConfiguration {
  // Add any custom options for useApi if needed
}

function useApi<T = any>(url: string | null, options?: UseApiOptions) {
  const { data, error, isValidating, mutate } = useSWR<T>(
    url,
    async (key) => {
      const response = await apiClient.get(key);
      return response.data;
    },
    options
  );

  return {
    data,
    error,
    loading: isValidating,
    mutate,
  };
}

export default useApi;
