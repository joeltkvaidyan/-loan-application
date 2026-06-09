import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useFormStore } from '../../store/formStore';
import ProgressBar from './ProgressBar';
import { useAutoSave } from '../../hooks/useAutoSave';

const Step1LoanType = lazy(() => import('../steps/Step1LoanType'));
const Step2PersonalInfo = lazy(() => import('../steps/Step2PersonalInfo'));
const Step3KYC = lazy(() => import('../steps/Step3KYC'));
const Step4Address = lazy(() => import('../steps/Step4Address'));
const Step5Employment = lazy(() => import('../steps/Step5Employment'));
const Step6CoApplicant = lazy(() => import('../steps/Step6CoApplicant'));
const Step7Documents = lazy(() => import('../steps/Step7Documents'));
const Step8Review = lazy(() => import('../steps/Step8Review'));

const STEP_COMPONENTS = {
  1: Step1LoanType,
  2: Step2PersonalInfo,
  3: Step3KYC,
  4: Step4Address,
  5: Step5Employment,
  6: Step6CoApplicant,
  7: Step7Documents,
  8: Step8Review,
};

function SaveIndicator({ lastSaved }) {
  if (!lastSaved) return null;
  const mins = Math.round((Date.now() - lastSaved) / 60000);
  return (
    <p className="text-xs text-gray-400 text-right">
      Draft saved {mins < 1 ? 'just now' : `${mins}m ago`}
    </p>
  );
}

export default function Wizard({ onComplete }) {
  const store = useFormStore();
  const { getActiveSteps, draftSaved, lastSaved } = store;
  const { save } = useAutoSave();
  const [currentStep, setCurrentStep] = useState(1);
  const firstInputRef = useRef(null);

  const activeSteps = getActiveSteps();
  const currentIndex = activeSteps.indexOf(currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === activeSteps.length - 1;

  // Focus first input on step change
  useEffect(() => {
    const el = document.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea');
    if (el) el.focus();
  }, [currentStep]);

  const goNext = () => {
    save();
    const next = activeSteps[currentIndex + 1];
    if (next) setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    const prev = activeSteps[currentIndex - 1];
    if (prev) setCurrentStep(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step) => {
    if (activeSteps.includes(step)) setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">LS</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">LendSwift</p>
                <p className="text-xs text-gray-500">Loan Application</p>
              </div>
            </div>
            <SaveIndicator lastSaved={lastSaved} />
          </div>
          <ProgressBar activeSteps={activeSteps} currentStep={currentStep} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Suspense fallback={
          <div className="step-card flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
              </svg>
              <p className="text-sm text-gray-500">Loading…</p>
            </div>
          </div>
        }>
          <StepComponent
            onNext={goNext}
            onPrev={goPrev}
            onGoToStep={goToStep}
            onSubmit={onComplete}
            isFirst={isFirst}
            isLast={isLast}
          />
        </Suspense>
      </main>

      <footer className="max-w-2xl mx-auto px-4 py-4 text-center">
        <p className="text-xs text-gray-400">
          🔒 256-bit AES encryption · RBI Compliant · Zetheta Algorithms Pvt. Ltd.
        </p>
      </footer>
    </div>
  );
}

// All step components are lazy-loaded (React.lazy + Suspense).
// This keeps the main bundle under 200KB gzip and defers step JS until needed.
