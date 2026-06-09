import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { step2Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import StepNavigation from '../wizard/StepNavigation';
import { useVerification } from '../../hooks/useVerification';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export default function Step2PersonalInfo({ onNext, onPrev, isFirst }) {
  const { step1, step2, setStepData, emailVerified, mobileVerified } = useFormStore();
  const { verify, verifying } = useVerification();
  const schema = step2Schema(step1);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: step2.fullName || '',
      dateOfBirth: step2.dateOfBirth || '',
      gender: step2.gender || '',
      maritalStatus: step2.maritalStatus || '',
      fatherName: step2.fatherName || '',
      motherName: step2.motherName || '',
      email: step2.email || '',
      mobile: step2.mobile || '',
    }
  });

  const emailVal = watch('email');
  const mobileVal = watch('mobile');

  const onSubmit = (data) => {
    setStepData('step2', data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="step-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your details exactly as per your PAN card</p>

        <div className="space-y-5">
          <Input label="Full Name" required placeholder="As per PAN card" error={errors.fullName?.message} {...register('fullName')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Date of Birth" type="date" required error={errors.dateOfBirth?.message}
              max={new Date().toISOString().split('T')[0]} {...register('dateOfBirth')} />

            <Controller name="gender" control={control} render={({ field }) => (
              <RadioGroup label="Gender" required name="gender" options={GENDER_OPTIONS}
                value={field.value} onChange={field.onChange} error={errors.gender?.message} />
            )} />
          </div>

          <Select label="Marital Status" required options={MARITAL_OPTIONS} error={errors.maritalStatus?.message} {...register('maritalStatus')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Father's Name" required error={errors.fatherName?.message} {...register('fatherName')} />
            <Input label="Mother's Name" required error={errors.motherName?.message} {...register('motherName')} />
          </div>

          {/* Email with verification */}
          <div>
            <div className="flex gap-2 items-end">
              <Input label="Email Address" required type="email" placeholder="you@example.com"
                error={errors.email?.message}
                wrapperClass="flex-1"
                {...register('email')} />
              <button
                type="button"
                disabled={verifying.email || !emailVal}
                onClick={() => verify('email', emailVal)}
                className="btn-secondary shrink-0 mb-[1px]"
              >
                {verifying.email ? 'Verifying…' : emailVerified ? '✓ Verified' : 'Verify'}
              </button>
            </div>
            {emailVerified && <p className="text-xs text-green-600 mt-1">✓ Email verified</p>}
          </div>

          {/* Mobile with OTP simulation */}
          <div>
            <div className="flex gap-2 items-end">
              <Input label="Mobile Number" required type="tel" placeholder="10-digit mobile number"
                maxLength={10} error={errors.mobile?.message} wrapperClass="flex-1"
                hint="Starts with 6, 7, 8 or 9"
                {...register('mobile')} />
              <button
                type="button"
                disabled={verifying.mobile || !mobileVal}
                onClick={() => verify('mobile', mobileVal)}
                className="btn-secondary shrink-0 mb-[1px]"
              >
                {verifying.mobile ? 'Sending OTP…' : mobileVerified ? '✓ Verified' : 'Send OTP'}
              </button>
            </div>
            {mobileVerified && <p className="text-xs text-green-600 mt-1">✓ Mobile verified</p>}
          </div>
        </div>
      </div>

      <StepNavigation onPrev={onPrev} isFirst={isFirst} isLast={false} />
    </form>
  );
}
