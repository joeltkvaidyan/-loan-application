import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { step8Schema } from '../../schemas/schemaFactory';
import { calculateEMI, calculateTotalCost, calculateProcessingFee, formatCurrency, formatINR } from '../../utils/emiCalculator';
import StepNavigation from '../wizard/StepNavigation';

function ReviewSection({ title, data, onEdit, stepNum }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepNum)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 min-h-[44px]"
        >
          Edit
        </button>
      </div>
      <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {Object.entries(data).filter(([_, v]) => v !== undefined && v !== '' && v !== null && v !== false).map(([key, val]) => (
          <div key={key} className="flex flex-col">
            <span className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-sm font-medium text-gray-800 break-words">{String(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step8Review({ onPrev, onGoToStep, onSubmit: onFinalSubmit }) {
  const store = useFormStore();
  const { step1, step2, step3, step4, step5, step6, uploads, signature, isStep6Required } = store;
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(step8Schema),
    defaultValues: {
      consent1: false, consent2: false, consent3: false, consent4: false,
    }
  });

  const { consent1, consent2, consent3, consent4 } = watch();
  const allConsents = consent1 && consent2 && consent3 && consent4;

  // Calculate EMI
  const principal = Number(step1.loanAmount) || 0;
  const tenure = Number(step1.loanTenure) || 12;
  const loanType = step1.loanType || 'personal';
  const emi = calculateEMI(principal, tenure, loanType);
  const totalCost = calculateTotalCost(emi, tenure, principal);
  const processingFee = calculateProcessingFee(principal);
  const rate = { personal: 10.5, home: 8.5, business: 14.0 }[loanType];

  // EMI ratio check
  let monthlyIncome = Number(step5.monthlyIncome) || (Number(step5.annualTurnover) / 12) || 0;
  if (isStep6Required()) monthlyIncome += Number(step6.coIncome) || 0;
  const emiRatio = monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 0;

  const uploadCount = Object.keys(uploads).length;

  const onSubmit = async (data) => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const refId = 'LS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    setSubmitting(false);
    onFinalSubmit && onFinalSubmit(refId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Pre-Approval Card */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-xl p-5 mb-5">
        <p className="text-xs uppercase tracking-wide text-blue-200 mb-3">Key Fact Statement (KFS)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Loan Amount', value: formatCurrency(principal) },
            { label: 'Tenure', value: `${tenure} months` },
            { label: 'Interest Rate', value: `${rate}% p.a.` },
            { label: 'Monthly EMI', value: formatCurrency(emi) },
            { label: 'Total Cost', value: formatCurrency(totalCost) },
            { label: 'Processing Fee', value: formatCurrency(processingFee) },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-blue-300">{item.label}</p>
              <p className="text-base font-bold">{item.value}</p>
            </div>
          ))}
        </div>
        {emiRatio > 50 && (
          <div className="mt-3 bg-yellow-400/20 border border-yellow-300/30 rounded-lg p-2.5">
            <p className="text-xs text-yellow-200">
              ⚠️ EMI-to-income ratio is {emiRatio.toFixed(1)}% (above 50%). This may affect approval.
            </p>
          </div>
        )}
      </div>

      {/* Review sections */}
      <div className="step-card mb-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Your Application</h2>
        <ReviewSection title="Loan Details" data={{ loanType: step1.loanType, amount: formatCurrency(principal), tenure: `${tenure} months`, purpose: step1.loanPurpose }} onEdit={onGoToStep} stepNum={1} />
        <ReviewSection title="Personal Information" data={{ fullName: step2.fullName, dob: step2.dateOfBirth, email: step2.email, mobile: step2.mobile, maritalStatus: step2.maritalStatus }} onEdit={onGoToStep} stepNum={2} />
        <ReviewSection title="KYC" data={{ pan: step3.pan ? '·····' + step3.pan.slice(-4) : '', aadhaar: step3.aadhaar ? '····' + step3.aadhaar.slice(-4) : '' }} onEdit={onGoToStep} stepNum={3} />
        <ReviewSection title="Address" data={{ address: step4.addressLine1, pinCode: step4.pinCode, city: step4.city, state: step4.state }} onEdit={onGoToStep} stepNum={4} />
        <ReviewSection title="Employment" data={{ type: step5.employmentType, company: step5.companyName || step5.businessName, income: step5.monthlyIncome ? formatCurrency(step5.monthlyIncome) : formatCurrency(step5.annualTurnover) + '/yr' }} onEdit={onGoToStep} stepNum={5} />
        {isStep6Required() && <ReviewSection title="Co-Applicant" data={{ name: step6.coApplicantName, relationship: step6.coRelationship }} onEdit={onGoToStep} stepNum={6} />}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Documents</span>
            <button type="button" onClick={() => onGoToStep(7)} className="text-xs text-blue-600 font-medium min-h-[44px]">Edit</button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{uploadCount} document(s) uploaded</p>
          {signature && <p className="text-xs text-green-600 mt-1">✓ E-Signature captured</p>}
        </div>
      </div>

      {/* Consents */}
      <div className="step-card mb-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RBI Mandatory Consents</h2>
        <p className="text-xs text-gray-500 mb-4">All four consents are individually required per RBI Digital Lending Guidelines (DL/2022/01)</p>
        <div className="space-y-4">
          {[
            { name: 'consent1', text: 'I have read and agree to the Loan Agreement, Terms & Conditions, and Privacy Policy of LendSwift / Zetheta Algorithms Pvt. Ltd.' },
            { name: 'consent2', text: 'I authorize LendSwift to access my credit bureau report and share my information with credit agencies for the purpose of this loan application.' },
            { name: 'consent3', text: 'I have read and understood the Key Fact Statement (KFS) including the loan amount, interest rate, EMI, total cost, and processing fee displayed above.' },
            { name: 'consent4', text: 'I acknowledge the 3 working-day cooling-off period during which I can withdraw this application without any penalty or charge.' },
          ].map((c, i) => (
            <label key={c.name} className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]">
              <input type="checkbox" {...register(c.name)} className="mt-0.5 accent-blue-600 w-4 h-4 shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-500 block mb-0.5">Consent {i + 1}</span>
                <span className="text-sm text-gray-700">{c.text}</span>
                {errors[c.name] && <p role="alert" aria-live="polite" className="error-msg">{errors[c.name].message}</p>}
              </div>
            </label>
          ))}
        </div>

        {/* Grievance */}
        <div className="mt-5 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
          <p className="font-medium text-gray-700 mb-1">Grievance Redressal</p>
          <p>Nodal Officer: grievance@lendswift.in | 1800-XXX-XXXX (Mon–Sat 9AM–6PM)</p>
          <p className="mt-0.5">RBI Ombudsman: <a href="https://cms.rbi.org.in" target="_blank" rel="noreferrer" className="text-blue-600 underline">cms.rbi.org.in</a></p>
        </div>

        <p className="text-xs text-center text-blue-700 font-medium mt-4 p-2 bg-blue-50 rounded-lg">
          ⏱ Cooling-off period: You have 3 working days after submission to withdraw without penalty.
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button type="button" onClick={onPrev} className="btn-secondary">← Back</button>
        <button
          type="submit"
          disabled={!allConsents || !signature || submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
              </svg>
              Submitting…
            </span>
          ) : 'Submit Application →'}
        </button>
      </div>
    </form>
  );
}
