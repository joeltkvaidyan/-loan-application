import React from 'react';

export default function StepNavigation({ onPrev, onNext, isFirst, isLast, loading }) {
  return (
    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst || loading}
        className="btn-secondary"
      >
        ← Back
      </button>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Processing…
          </span>
        ) : isLast ? 'Submit Application' : 'Continue →'}
      </button>
    </div>
  );
}
