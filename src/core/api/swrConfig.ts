import { SWRConfiguration } from 'swr';
import apiClient from './apiClient';

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  // Add other global SWR configurations here
};
