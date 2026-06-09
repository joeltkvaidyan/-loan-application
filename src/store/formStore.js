import { create } from 'zustand';

const DRAFT_KEY = 'lendswift_draft';
const DRAFT_TTL = 72 * 60 * 60 * 1000; // 72 hours

export const useFormStore = create((set, get) => ({
  // Step data
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {},
  step6: {},
  step7: {},
  step8: {},

  // Verification states
  panVerified: false,
  aadhaarVerified: false,
  emailVerified: false,
  mobileVerified: false,
  coPanVerified: false,

  // File uploads
  uploads: {},

  // E-signature
  signature: null,
  coSignature: null,

  // Draft metadata
  draftSaved: false,
  lastSaved: null,

  setStepData: (step, data) => set(state => ({
    [step]: { ...state[step], ...data }
  })),

  setVerification: (field, value) => set({ [field]: value }),

  setUpload: (field, file) => set(state => ({
    uploads: { ...state.uploads, [field]: file }
  })),

  removeUpload: (field) => set(state => {
    const uploads = { ...state.uploads };
    delete uploads[field];
    return { uploads };
  }),

  setSignature: (sig) => set({ signature: sig }),
  setCoSignature: (sig) => set({ coSignature: sig }),

  markDraftSaved: () => set({ draftSaved: true, lastSaved: Date.now() }),

  // Step 6 visibility logic
  isStep6Required: () => {
    const { step1 } = get();
    const { loanType, loanAmount } = step1;
    if (loanType === 'home') return true;
    if (loanType === 'personal' && Number(loanAmount) > 500000) return true;
    if (loanType === 'business' && Number(loanAmount) > 2000000) return true;
    return false;
  },

  getActiveSteps: () => {
    const { step1 } = get();
    const steps = [1, 2, 3, 4, 5];
    if (get().isStep6Required()) steps.push(6);
    steps.push(7, 8);
    return steps;
  },

  resetForm: () => set({
    step1: {}, step2: {}, step3: {}, step4: {}, step5: {},
    step6: {}, step7: {}, step8: {},
    panVerified: false, aadhaarVerified: false,
    emailVerified: false, mobileVerified: false, coPanVerified: false,
    uploads: {}, signature: null, coSignature: null, draftSaved: false, lastSaved: null,
  }),
}));
