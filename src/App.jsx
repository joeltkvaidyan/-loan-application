import React, { useEffect, useState } from 'react';
import Wizard from './components/wizard/Wizard';
import { useFormStore } from './store/formStore';
import { useFormPersistence } from './hooks/useAutoSave';

function ResumeModal({ draft, onResume, onStartFresh }) {
  const savedDate = new Date(draft.savedAt);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💾</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">Resume Application?</h2>
        <p className="text-sm text-gray-600 text-center mb-1">
          We found a saved draft from{' '}
          <span className="font-medium">{savedDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </p>
        <p className="text-xs text-gray-500 text-center mb-6">
          Your progress is securely encrypted and stored locally.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onResume} className="btn-primary w-full">Resume where I left off</button>
          <button onClick={onStartFresh} className="btn-secondary w-full">Start fresh</button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ refId, onReset }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-sm text-gray-500 mb-1">Your reference number</p>
        <p className="text-lg font-mono font-bold text-blue-700 bg-blue-50 rounded-lg px-4 py-2 mb-4">{refId}</p>
        <div className="text-left bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 space-y-2">
          <p className="text-xs font-semibold text-amber-800">⏱ Cooling-Off Period</p>
          <p className="text-xs text-amber-700">
            You have <strong>3 working days</strong> from submission to withdraw without penalty.
            Contact withdraw@lendswift.in or 1800-XXX-XXXX.
          </p>
        </div>
        <div className="text-left bg-gray-50 rounded-lg p-4 mb-5 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700">Grievance Redressal</p>
          <p>Nodal Officer: grievance@lendswift.in | 1800-XXX-XXXX</p>
          <p>RBI Ombudsman: <a href="https://cms.rbi.org.in" target="_blank" rel="noreferrer" className="text-blue-600 underline">cms.rbi.org.in</a></p>
        </div>
        <button onClick={onReset} className="btn-secondary w-full">Start New Application</button>
      </div>
    </div>
  );
}

export default function App() {
  const [showResume, setShowResume] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [successRefId, setSuccessRefId] = useState(null);
  const { loadDraft, clearDraft, restoreDraft } = useFormPersistence();
  const { resetForm } = useFormStore();

  useEffect(() => {
    loadDraft().then(draft => {
      if (draft) { setDraftData(draft); setShowResume(true); }
    });
  }, []);

  const handleResume = () => {
    restoreDraft(draftData);
    setShowResume(false);
  };

  const handleStartFresh = () => {
    clearDraft();
    resetForm();
    setShowResume(false);
  };

  const handleComplete = (refId) => {
    clearDraft();
    setSuccessRefId(refId);
  };

  const handleReset = () => {
    resetForm();
    setSuccessRefId(null);
  };

  return (
    <>
      <Wizard onComplete={handleComplete} />
      {showResume && draftData && (
        <ResumeModal draft={draftData} onResume={handleResume} onStartFresh={handleStartFresh} />
      )}
      {successRefId && (
        <SuccessModal refId={successRefId} onReset={handleReset} />
      )}
    </>
  );
}
