export const LOAN_RATES = {
  personal: 10.5,
  home: 8.5,
  business: 14.0,
};

export function calculateEMI(principal, tenureMonths, loanType) {
  const annualRate = LOAN_RATES[loanType] || 10.5;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  if (r === 0) return principal / n;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

export function calculateTotalCost(emi, tenure, principal) {
  return emi * tenure - principal;
}

export function calculateProcessingFee(principal) {
  const fee = principal * 0.01;
  return Math.max(Math.min(fee, 25000), 2000);
}

// Format in Indian number system
export function formatINR(num) {
  if (!num && num !== 0) return '0';
  const n = Math.round(Number(num));
  return n.toLocaleString('en-IN');
}

export function formatCurrency(num) {
  return '₹' + formatINR(num);
}

// Parse currency string to number
export function parseCurrency(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[^0-9.]/g, '')) || 0;
}

export function maskPAN(pan) {
  if (!pan || pan.length < 4) return pan;
  return '·'.repeat(pan.length - 4) + pan.slice(-4);
}

export function maskAadhaar(aadhaar) {
  if (!aadhaar || aadhaar.length < 4) return aadhaar;
  const digits = aadhaar.replace(/\s/g, '');
  return '·'.repeat(digits.length - 4) + digits.slice(-4);
}
