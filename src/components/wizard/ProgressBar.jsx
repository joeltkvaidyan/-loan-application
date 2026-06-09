import React from 'react';

const STEP_LABELS = {
  1: 'Loan Type',
  2: 'Personal Info',
  3: 'KYC',
  4: 'Address',
  5: 'Employment',
  6: 'Co-Applicant',
  7: 'Documents',
  8: 'Review',
};

export default function ProgressBar({ activeSteps, currentStep }) {
  const totalSteps = activeSteps.length;
  const currentIndex = activeSteps.indexOf(currentStep);
  const progressPct = totalSteps > 1 ? (currentIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full">
      {/* Mobile: compact */}
      <div className="flex items-center justify-between mb-2 sm:hidden">
        <span className="text-sm font-semibold text-blue-700">
          Step {currentIndex + 1} of {totalSteps}
        </span>
        <span className="text-sm text-gray-600">{STEP_LABELS[currentStep]}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full mb-4 sm:hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(5, progressPct)}%` }}
        />
      </div>

      {/* Desktop: step pills */}
      <nav
        aria-label={`Form progress: Step ${currentIndex + 1} of ${totalSteps}, ${STEP_LABELS[currentStep]}`}
        className="hidden sm:flex items-center gap-1 overflow-x-auto pb-1"
      >
        {activeSteps.map((step, idx) => {
          const done = idx < currentIndex;
          const active = step === currentStep;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-gray-200 text-gray-500'}`}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? '✓' : step}
                </div>
                <span className={`text-xs mt-0.5 whitespace-nowrap ${active ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {idx < activeSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 min-w-[8px] transition-colors ${idx < currentIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
