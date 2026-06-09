import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { step6Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import SignatureCanvas from '../common/SignatureCanvas';
import StepNavigation from '../wizard/StepNavigation';
import { useVerification } from '../../hooks/useVerification';

const getRelationOptions = (maritalStatus) => {
  const base = [
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'other', label: 'Other' },
  ];
  if (maritalStatus === 'married') {
    return [{ value: 'spouse', label: 'Spouse' }, ...base];
  }
  return base;
};

export default function Step6CoApplicant({ onNext, onPrev }) {
  const { step2, step6, setStepData, setCoSignature, coSignature, coPanVerified } = useFormStore();
  const { verify, verifying } = useVerification();

  const defaultRelation = step2.maritalStatus === 'married' ? 'spouse' : '';
  const relationOptions = getRelationOptions(step2.maritalStatus);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      coApplicantName: step6.coApplicantName || '',
      coRelationship: step6.coRelationship || defaultRelation,
      coPan: step6.coPan || '',
      coIncome: step6.coIncome || '',
      coConsent: step6.coConsent || false,
    }
  });

  const coPanVal = watch('coPan');

  const onSubmit = (data) => {
    if (!coSignature) { alert('Please provide co-applicant signature'); return; }
    setStepData('step6', data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="step-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Co-Applicant & Guarantor</h2>
        <p className="text-sm text-gray-500 mb-2">A co-applicant is required for this loan application</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-800">
            Co-applicant required because: {
              step6.reason || 'Home loan always requires a co-applicant, or personal/business loan exceeds threshold'
            }
          </p>
        </div>

        <div className="space-y-5">
          <Input label="Co-Applicant Full Name" required error={errors.coApplicantName?.message} {...register('coApplicantName')} />

          <Select label="Relationship to Primary Applicant" required options={relationOptions}
            error={errors.coRelationship?.message} {...register('coRelationship')} />

          <div>
            <div className="flex gap-2 items-end">
              <Input label="Co-Applicant PAN" required placeholder="ABCDE1234F" maxLength={10}
                wrapperClass="flex-1" error={errors.coPan?.message} {...register('coPan')} />
              <button
                type="button"
                disabled={verifying.coPan || !coPanVal || coPanVal.length < 10}
                onClick={() => verify('coPan', coPanVal)}
                className="btn-secondary shrink-0 mb-[1px]"
              >
                {verifying.coPan ? 'Verifying…' : coPanVerified ? '✓ Verified' : 'Verify PAN'}
              </button>
            </div>
          </div>

          <Controller name="coIncome" control={control} render={({ field }) => (
            <CurrencyInput label="Co-Applicant Monthly Income" required value={field.value}
              onChange={field.onChange} error={errors.coIncome?.message}
              hint="Combined with primary applicant for EMI ratio calculation" />
          )} />

          <SignatureCanvas
            label="Co-Applicant Signature"
            required
            value={coSignature}
            onChange={setCoSignature}
            error={!coSignature && errors.coConsent ? 'Co-applicant signature required' : undefined}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('coConsent')} className="mt-0.5 accent-blue-600 w-4 h-4 shrink-0" />
              <span className="text-xs text-amber-800">
                I, the co-applicant, confirm that I have read and understood the loan terms, consent to this
                joint application, and authorize LendSwift to process my information for credit assessment.
              </span>
            </label>
            {errors.coConsent && <p role="alert" aria-live="polite" className="error-msg mt-1">{errors.coConsent.message}</p>}
          </div>
        </div>
      </div>

      <StepNavigation onPrev={onPrev} isFirst={false} isLast={false} />
    </form>
  );
}
