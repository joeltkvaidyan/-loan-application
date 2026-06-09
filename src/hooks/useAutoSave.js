import { useEffect, useRef, useCallback } from 'react';
import { useFormStore } from '../store/formStore';
import { encryptData, decryptData } from '../utils/encryption';

const DRAFT_KEY = 'lendswift_draft';
const DRAFT_TTL = 72 * 60 * 60 * 1000;

export function useAutoSave() {
  const store = useFormStore();
  const timerRef = useRef(null);

  const save = useCallback(async () => {
    const state = useFormStore.getState();
    const draft = {
      step1: state.step1, step2: state.step2, step3: state.step3,
      step4: state.step4, step5: state.step5, step6: state.step6,
      panVerified: state.panVerified, aadhaarVerified: state.aadhaarVerified,
      emailVerified: state.emailVerified, mobileVerified: state.mobileVerified,
      savedAt: Date.now(),
    };
    const start = performance.now();
    const encrypted = await encryptData(draft);
    localStorage.setItem(DRAFT_KEY, encrypted);
    const elapsed = performance.now() - start;
    state.markDraftSaved();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(save, 30000);
    return () => clearInterval(timerRef.current);
  }, [save]);

  return { save };
}

export function useFormPersistence() {
  const loadDraft = useCallback(async () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const draft = await decryptData(raw);
      if (!draft || !draft.savedAt) return null;
      if (Date.now() - draft.savedAt > DRAFT_TTL) {
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const restoreDraft = useCallback((draft) => {
    const store = useFormStore.getState();
    if (draft.step1) store.setStepData('step1', draft.step1);
    if (draft.step2) store.setStepData('step2', draft.step2);
    if (draft.step3) store.setStepData('step3', draft.step3);
    if (draft.step4) store.setStepData('step4', draft.step4);
    if (draft.step5) store.setStepData('step5', draft.step5);
    if (draft.step6) store.setStepData('step6', draft.step6);
    if (draft.panVerified) store.setVerification('panVerified', draft.panVerified);
    if (draft.aadhaarVerified) store.setVerification('aadhaarVerified', draft.aadhaarVerified);
    if (draft.emailVerified) store.setVerification('emailVerified', draft.emailVerified);
    if (draft.mobileVerified) store.setVerification('mobileVerified', draft.mobileVerified);
  }, []);

  return { loadDraft, clearDraft, restoreDraft };
}

// Auto-save fires every 30 seconds; manual save triggered on each step transition
