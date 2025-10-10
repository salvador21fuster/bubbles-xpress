import { useState } from 'react';

export function useLoadingAction() {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = async <T,>(action: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await action();
      setTimeout(() => setIsLoading(false), 800);
      return result;
    } catch (error) {
      setTimeout(() => setIsLoading(false), 800);
      throw error;
    }
  };

  return { isLoading, withLoading };
}
