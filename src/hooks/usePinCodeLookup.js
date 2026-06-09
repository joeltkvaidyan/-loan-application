import { useCallback } from 'react';
import pinCodeData from '../utils/pinCodeData.json';

export function usePinCodeLookup() {
  const lookup = useCallback(async (pin) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));
    const result = pinCodeData[pin];
    if (!result) return { found: false };
    return { found: true, ...result };
  }, []);

  return { lookup };
}
