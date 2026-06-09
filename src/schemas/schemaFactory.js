import { z } from 'zod';
import { validatePAN, validateAadhaar, validateGST, validateMobile } from '../utils/validators';

// Step 1
export const step1Schema = z.object({
  loanType: z.enum(['personal', 'home', 'business'], { required_error: 'Select a loan type' }),
  loanAmount: z.preprocess(Number, z.number({ required_error: 'Enter loan amount' }).positive()),
  loanTenure: z.string().min(1, 'Select tenure'),
  loanPurpose: z.string().min(1, 'Select loan purpose'),
  referralCode: z.string().refine(v => !v || /^[A-Z0-9]{6,10}$/i.test(v), 'Invalid referral code').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  const amt = Number(data.loanAmount);
  if (data.loanType === 'personal' && (amt < 50000 || amt > 1000000)) {
    ctx.addIssue({ path: ['loanAmount'], code: z.ZodIssueCode.custom, message: 'Personal loan: ₹50,000 – ₹10,00,000' });
  }
  if (data.loanType === 'home' && (amt < 50000 || amt > 10000000)) {
    ctx.addIssue({ path: ['loanAmount'], code: z.ZodIssueCode.custom, message: 'Home loan: ₹50,000 – ₹1,00,00,000' });
  }
  if (data.loanType === 'business' && (amt < 50000 || amt > 5000000)) {
    ctx.addIssue({ path: ['loanAmount'], code: z.ZodIssueCode.custom, message: 'Business loan: ₹50,000 – ₹50,00,000' });
  }
});

// Step 2
export const step2Schema = (step1Data) => z.object({
  fullName: z.string().min(2, 'Min 2 chars').max(100, 'Max 100 chars').regex(/^[a-zA-Z\s]+$/, 'No special characters'),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Select gender' }),
  maritalStatus: z.string().min(1, 'Select marital status'),
  fatherName: z.string().min(2, 'Min 2 chars').max(100),
  motherName: z.string().min(2, 'Min 2 chars').max(100),
  email: z.string().email('Invalid email'),
  mobile: z.string().refine(validateMobile, 'Enter valid 10-digit mobile number starting with 6-9'),
}).superRefine((data, ctx) => {
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    const age = (today - dob) / (365.25 * 24 * 3600 * 1000);
    if (age < 21) ctx.addIssue({ path: ['dateOfBirth'], code: z.ZodIssueCode.custom, message: 'Minimum age is 21 years' });
    if (age > 65) ctx.addIssue({ path: ['dateOfBirth'], code: z.ZodIssueCode.custom, message: 'Maximum age is 65 years' });
    // Cross-step: age + tenure ≤ 65
    const tenure = Number(step1Data?.loanTenure) || 0;
    if (age + (tenure / 12) > 65) {
      ctx.addIssue({ path: ['dateOfBirth'], code: z.ZodIssueCode.custom, message: `Age + loan tenure exceeds 65 years` });
    }
  }
});

// Step 3
export const step3Schema = z.object({
  pan: z.string().refine(validatePAN, 'Invalid PAN format (e.g. ABCDE1234F)').refine(v => v.length > 0, 'PAN required'),
  aadhaar: z.string().refine(v => validateAadhaar(v), 'Invalid Aadhaar (Verhoeff checksum failed)'),
  aadhaarConsent: z.boolean().refine(v => v === true, 'Aadhaar consent is mandatory'),
  voterId: z.string().refine(v => !v || /^[A-Z]{3}[0-9]{7}$/.test(v), 'Invalid Voter ID format').optional().or(z.literal('')),
  passport: z.string().refine(v => !v || /^[A-Z][0-9]{7}$/.test(v), 'Invalid Passport format').optional().or(z.literal('')),
});

// Step 4
export const step4Schema = z.object({
  addressLine1: z.string().min(5, 'Min 5 chars').max(200, 'Max 200 chars'),
  pinCode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit PIN code'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
  residenceType: z.string().min(1, 'Select residence type'),
  rentAmount: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  yearsAtAddress: z.preprocess(Number, z.number().min(0).max(50, 'Max 50 years')),
  prevAddressLine1: z.string().optional().or(z.literal('')),
  prevPinCode: z.string().optional().or(z.literal('')),
  prevCity: z.string().optional().or(z.literal('')),
  prevState: z.string().optional().or(z.literal('')),
  permAddressSame: z.boolean().optional(),
  permAddressLine1: z.string().optional().or(z.literal('')),
  permPinCode: z.string().optional().or(z.literal('')),
  permCity: z.string().optional().or(z.literal('')),
  permState: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.residenceType === 'rented' && (!data.rentAmount || data.rentAmount <= 0)) {
    ctx.addIssue({ path: ['rentAmount'], code: z.ZodIssueCode.custom, message: 'Enter monthly rent amount' });
  }
  if (!data.permAddressSame) {
    if (!data.permAddressLine1) ctx.addIssue({ path: ['permAddressLine1'], code: z.ZodIssueCode.custom, message: 'Permanent address required' });
    if (!data.permPinCode || !/^\d{6}$/.test(data.permPinCode)) ctx.addIssue({ path: ['permPinCode'], code: z.ZodIssueCode.custom, message: 'Valid PIN required' });
    if (!data.permCity) ctx.addIssue({ path: ['permCity'], code: z.ZodIssueCode.custom, message: 'City required' });
    if (!data.permState) ctx.addIssue({ path: ['permState'], code: z.ZodIssueCode.custom, message: 'State required' });
  }
});

// Step 5
const salariedSchema = z.object({
  employmentType: z.literal('salaried'),
  companyName: z.string().min(2, 'Company name required'),
  monthlyIncome: z.preprocess(Number, z.number().min(15000, 'Minimum ₹15,000 for salaried')),
  yearsInJob: z.preprocess(Number, z.number().min(0).max(50)),
});

const selfEmpSchema = z.object({
  employmentType: z.literal('self_employed'),
  businessName: z.string().min(2, 'Business name required'),
  annualTurnover: z.preprocess(Number, z.number().min(300000, 'Minimum ₹3,00,000 annual turnover')),
  yearsInBusiness: z.preprocess(Number, z.number().min(2, 'Minimum 2 years in business')),
});

const bizOwnerSchema = z.object({
  employmentType: z.literal('business_owner'),
  businessName: z.string().min(2, 'Business name required'),
  annualTurnover: z.preprocess(Number, z.number().min(300000, 'Minimum ₹3,00,000 annual turnover')),
  gstNumber: z.string().refine(validateGST, 'Invalid GST number format'),
  yearsInBusiness: z.preprocess(Number, z.number().min(2, 'Minimum 2 years in business')),
});

export const step5Schema = z.discriminatedUnion('employmentType', [salariedSchema, selfEmpSchema, bizOwnerSchema]);

// Step 6
export const step6Schema = z.object({
  coApplicantName: z.string().min(2, 'Co-applicant name required').max(100),
  coRelationship: z.string().min(1, 'Select relationship'),
  coPan: z.string().refine(validatePAN, 'Invalid PAN format'),
  coIncome: z.preprocess(Number, z.number().min(1, 'Co-applicant income required')),
  coConsent: z.boolean().refine(v => v === true, 'Co-applicant consent required'),
}).optional();

// Step 7 - validated programmatically via required fields list
export const step7Schema = z.object({}).passthrough();

// Step 8
export const step8Schema = z.object({
  consent1: z.boolean().refine(v => v === true, 'Required'),
  consent2: z.boolean().refine(v => v === true, 'Required'),
  consent3: z.boolean().refine(v => v === true, 'Required'),
  consent4: z.boolean().refine(v => v === true, 'Required'),
});

// schemaFactory - returns correct schema per step incorporating cross-step dependencies
export function schemaFactory(step, fullFormState) {
  switch (step) {
    case 1: return step1Schema;
    case 2: return step2Schema(fullFormState.step1);
    case 3: return step3Schema;
    case 4: return step4Schema;
    case 5: return step5Schema;
    case 6: return step6Schema;
    case 7: return step7Schema;
    case 8: return step8Schema;
    default: return z.object({});
  }
}
