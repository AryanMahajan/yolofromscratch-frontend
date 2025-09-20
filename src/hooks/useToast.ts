import { toast } from 'react-toastify';

export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warn' = 'info') => {
    toast(message, { type });
  };

  return { showToast };
};