// PAN Validation
export function validatePAN(pan) {
  if (!pan) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
}

export function getPANEntityType(pan) {
  if (!pan || pan.length < 4) return null;
  return pan[3];
}

export function validatePANForLoanType(pan, loanType) {
  const entityChar = getPANEntityType(pan);
  if (!entityChar) return false;
  if (loanType === 'business') {
    return ['P', 'C', 'F'].includes(entityChar);
  }
  return entityChar === 'P';
}

// Verhoeff Algorithm Tables
const verhoeffMultTable = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];

const verhoeffPermTable = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8],
];

const verhoeffInvTable = [0,4,3,2,1,9,8,7,6,5];

export function validateAadhaar(num) {
  const digits = num.replace(/\s/g, '');
  if (!/^\d{12}$/.test(digits)) return false;
  let c = 0;
  const arr = digits.split('').reverse().map(Number);
  for (let i = 0; i < arr.length; i++) {
    c = verhoeffMultTable[c][verhoeffPermTable[i % 8][arr[i]]];
  }
  return c === 0;
}

// GST Validation
export function validateGST(gst) {
  if (!gst) return false;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst);
}

// Mobile validation
export function validateMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

// Voter ID
export function validateVoterId(id) {
  return /^[A-Z]{3}[0-9]{7}$/.test(id);
}

// Passport
export function validatePassport(p) {
  return /^[A-Z][0-9]{7}$/.test(p);
}

// Referral code
export function validateReferralCode(code) {
  return /^[A-Z0-9]{6,10}$/i.test(code);
}
