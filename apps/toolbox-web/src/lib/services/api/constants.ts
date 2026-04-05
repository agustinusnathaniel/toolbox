import { QueryClient } from '@tanstack/react-query';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createQueryClient = () => new QueryClient();
