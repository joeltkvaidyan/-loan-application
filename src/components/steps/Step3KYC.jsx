import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { step3Schema } from '../../schemas/schemaFactory';
import MaskedInput from '../common/MaskedInput';
import Input from '../common/Input';
import StepNavigation from '../wizard/StepNavigation';
import { useVerification } from '../../hooks/useVerification';

export default function Step3KYC({ onNext, onPrev }) {
  const { step1, step3, setStepData, panVerified, aadhaarVerified } = useFormStore();
  const { verify, verifying } = useVerification();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      pan: step3.pan || '',
      aadhaar: step3.aadhaar || '',
      aadhaarConsent: step3.aadhaarConsent || false,
      voterId: step3.voterId || '',
      passport: step3.passport || '',
    }
  });

  const panVal = watch('pan');
  const aadhaarVal = watch('aadhaar');
  const showPassport = step1.loanType === 'home' && Number(step1.loanAmount) > 500000;

  const onSubmit = (data) => {
    setStepData('step3', data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="step-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">KYC & Identity Verification</h2>
        <p className="text-sm text-gray-500 mb-6">Your documents are encrypted and stored securely</p>

        <div className="space-y-5">
          {/* PAN */}
          <div>
            <div className="flex gap-2 items-end">
              <Controller name="pan" control={control} render={({ field }) => (
                <MaskedInput
                  label="PAN Number"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  wrapperClass="flex-1"
                  error={errors.pan?.message}
                  verified={panVerified ? true : panVerified === false && field.value ? false : undefined}
                  hint="5 letters + 4 digits + 1 letter (uppercase)"
                />
              )} />
              <button
                type="button"
                disabled={verifying.pan || !panVal || panVal.length < 10}
                onClick={() => verify('pan', panVal, { loanType: step1.loanType })}
                className="btn-secondary shrink-0 mb-[1px]"
              >
                {verifying.pan ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
                    </svg>
                    Verifying
                  </span>
                ) : panVerified ? '✓ Verified' : 'Verify PAN'}
              </button>
            </div>
            {panVerified && <p className="text-xs text-green-600 mt-1">✓ PAN verified — document upload optional</p>}
          </div>

          {/* Aadhaar */}
          <div>
            <div className="flex gap-2 items-end">
              <Controller name="aadhaar" control={control} render={({ field }) => (
                <MaskedInput
                  label="Aadhaar Number"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                  wrapperClass="flex-1"
                  error={errors.aadhaar?.message}
                  verified={aadhaarVerified ? true : undefined}
                  hint="12-digit number (validated via Verhoeff checksum)"
                />
              )} />
              <button
                type="button"
                disabled={verifying.aadhaar || !aadhaarVal || aadhaarVal.length < 12}
                onClick={() => verify('aadhaar', aadhaarVal)}
                className="btn-secondary shrink-0 mb-[1px]"
              >
                {verifying.aadhaar ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
                    </svg>
                    Verifying
                  </span>
                ) : aadhaarVerified ? '✓ Verified' : 'Verify'}
              </button>
            </div>

            {/* Aadhaar Consent */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('aadhaarConsent')}
                  className="mt-0.5 accent-blue-600 w-4 h-4 shrink-0"
                />
                <span className="text-xs text-amber-800">
                  I voluntarily provide my Aadhaar details and consent to its use for KYC verification as per UIDAI regulations.
                  This consent can be revoked anytime.
                </span>
              </label>
              {errors.aadhaarConsent && (
                <p role="alert" aria-live="polite" className="error-msg mt-1">{errors.aadhaarConsent.message}</p>
              )}
            </div>
          </div>

          {/* Optional documents */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Optional Documents</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Voter ID"
                placeholder="AAA0000000"
                hint="3 letters + 7 digits"
                error={errors.voterId?.message}
                {...register('voterId')}
              />
              {showPassport && (
                <Input
                  label="Passport Number"
                  placeholder="A0000000"
                  hint="Required for Home Loan > ₹50L"
                  error={errors.passport?.message}
                  {...register('passport')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <StepNavigation onPrev={onPrev} isFirst={false} isLast={false} />
    </form>
  );
}
