import { useCallback, useState } from 'react';
import { useFormStore } from '../store/formStore';
import { validatePAN, validateAadhaar, validatePANForLoanType } from '../utils/validators';

export function useVerification() {
  const [verifying, setVerifying] = useState({});
  const store = useFormStore();

  const verify = useCallback(async (type, value, extra = {}) => {
    setVerifying(v => ({ ...v, [type]: true }));
    await new Promise(r => setTimeout(r, 1500)); // simulate API
    let success = false;

    if (type === 'pan') {
      success = validatePAN(value) && validatePANForLoanType(value, extra.loanType || 'personal');
      store.setVerification('panVerified', success);
    } else if (type === 'aadhaar') {
      success = validateAadhaar(value);
      store.setVerification('aadhaarVerified', success);
    } else if (type === 'email') {
      success = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      store.setVerification('emailVerified', success);
    } else if (type === 'mobile') {
      success = /^[6-9]\d{9}$/.test(value);
      store.setVerification('mobileVerified', success);
    } else if (type === 'coPan') {
      success = validatePAN(value);
      store.setVerification('coPanVerified', success);
    }

    setVerifying(v => ({ ...v, [type]: false }));
    return success;
  }, [store]);

  return { verify, verifying };
}
