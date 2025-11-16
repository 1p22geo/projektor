import useSWR from 'swr';
import axiosInstance from '../api'; // Import the configured axios instance

export const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

export const useApi = <T>(url: string) => {
  return useSWR<T>(url, fetcher);
};