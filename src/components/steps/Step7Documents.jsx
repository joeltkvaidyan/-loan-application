import React from 'react';
import { useFormStore } from '../../store/formStore';
import FileUpload from '../common/FileUpload';
import SignatureCanvas from '../common/SignatureCanvas';
import StepNavigation from '../wizard/StepNavigation';

function getRequiredDocs(step1, step3, step5) {
  const docs = [
    { field: 'aadhaar_front', label: 'Aadhaar Card (Front)', accept: '.pdf,.jpg,.jpeg,.png', maxSizeMB: 5, required: true },
    { field: 'aadhaar_back', label: 'Aadhaar Card (Back)', accept: '.pdf,.jpg,.jpeg,.png', maxSizeMB: 5, required: true },
    { field: 'photo', label: 'Passport Photo', accept: '.jpg,.jpeg,.png', maxSizeMB: 2, required: true },
    { field: 'bank_statements', label: 'Bank Statements (6 months)', accept: '.pdf', maxSizeMB: 10, required: true },
  ];

  // PAN copy — optional if verified
  if (!step3?.panVerified) {
    docs.unshift({ field: 'pan_card', label: 'PAN Card Copy', accept: '.pdf,.jpg,.jpeg,.png', maxSizeMB: 5, required: true });
  } else {
    docs.unshift({ field: 'pan_card', label: 'PAN Card Copy', accept: '.pdf,.jpg,.jpeg,.png', maxSizeMB: 5, required: false, hint: 'Optional — PAN verified digitally' });
  }

  const empType = step5?.employmentType;
  if (empType === 'salaried') {
    docs.push({ field: 'salary_slips', label: 'Salary Slips (3 months)', accept: '.pdf', maxSizeMB: 5, required: true });
  } else {
    docs.push({ field: 'itr_1', label: 'ITR Year 1', accept: '.pdf', maxSizeMB: 5, required: true });
    docs.push({ field: 'itr_2', label: 'ITR Year 2', accept: '.pdf', maxSizeMB: 5, required: true });
  }

  if (step1?.loanType === 'home') {
    docs.push({ field: 'property_docs', label: 'Property Documents', accept: '.pdf', maxSizeMB: 10, required: true });
  }

  if (step1?.loanType === 'business') {
    docs.push({ field: 'biz_reg', label: 'Business Registration Certificate', accept: '.pdf', maxSizeMB: 5, required: true });
    docs.push({ field: 'gst_returns_1', label: 'GST Returns Q1', accept: '.pdf', maxSizeMB: 5, required: true });
    docs.push({ field: 'gst_returns_2', label: 'GST Returns Q2', accept: '.pdf', maxSizeMB: 5, required: true });
    docs.push({ field: 'gst_returns_3', label: 'GST Returns Q3', accept: '.pdf', maxSizeMB: 5, required: true });
    docs.push({ field: 'gst_returns_4', label: 'GST Returns Q4', accept: '.pdf', maxSizeMB: 5, required: true });
  }

  return docs;
}

export default function Step7Documents({ onNext, onPrev }) {
  const store = useFormStore();
  const { step1, step3, step5, uploads, signature, setSignature } = store;
  const [submitError, setSubmitError] = React.useState('');

  const docs = getRequiredDocs(step1, { panVerified: store.panVerified }, step5);

  const handleNext = () => {
    setSubmitError('');
    // Check required uploads
    const missing = docs.filter(d => d.required && !uploads[d.field]);
    if (missing.length > 0) {
      setSubmitError(`Please upload: ${missing.map(d => d.label).join(', ')}`);
      return;
    }
    if (!signature) {
      setSubmitError('Please provide your e-signature before continuing.');
      return;
    }
    onNext();
  };

  return (
    <div>
      <div className="step-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Documents & E-Signature</h2>
        <p className="text-sm text-gray-500 mb-2">Upload clear, legible copies. JPG/PNG images are automatically compressed.</p>
        <div id="upload-live-region" role="status" aria-live="polite" className="sr-only" />

        <div className="space-y-4 mb-6">
          {docs.map(doc => (
            <FileUpload key={doc.field} {...doc} />
          ))}
        </div>

        <div className="border-t border-gray-100 pt-5">
          <SignatureCanvas
            label="Applicant E-Signature"
            required
            value={signature}
            onChange={setSignature}
            error={submitError && !signature ? 'Signature required' : undefined}
          />
        </div>

        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p role="alert" aria-live="polite" className="text-sm text-red-700">{submitError}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <button type="button" onClick={onPrev} className="btn-secondary">← Back</button>
        <button type="button" onClick={handleNext} className="btn-primary">Continue →</button>
      </div>
    </div>
  );
}
