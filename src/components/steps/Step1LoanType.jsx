import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { step1Schema } from '../../schemas/schemaFactory';
import RadioGroup from '../common/RadioGroup';
import CurrencyInput from '../common/CurrencyInput';
import Select from '../common/Select';
import Input from '../common/Input';
import StepNavigation from '../wizard/StepNavigation';

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan', description: '₹50K–₹10L · 12–60 months · 10.5% p.a.' },
  { value: 'home', label: 'Home Loan', description: '₹50K–₹1Cr · 60–360 months · 8.5% p.a.' },
  { value: 'business', label: 'Business Loan', description: '₹50K–₹50L · 12–84 months · 14% p.a.' },
];

const TENURE_BY_TYPE = {
  personal: Array.from({ length: 49 }, (_, i) => i + 12).filter(m => m <= 60).map(m => ({ value: String(m), label: `${m} months` })),
  home: [60,84,120,180,240,300,360].map(m => ({ value: String(m), label: `${m} months (${m/12} yrs)` })),
  business: [12,18,24,36,48,60,72,84].map(m => ({ value: String(m), label: `${m} months` })),
};

const PURPOSE_BY_TYPE = {
  personal: [
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'home_renovation', label: 'Home Renovation' },
    { value: 'debt_consolidation', label: 'Debt Consolidation' },
    { value: 'other', label: 'Other' },
  ],
  home: [
    { value: 'purchase', label: 'Purchase New Home' },
    { value: 'construction', label: 'Construction' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'balance_transfer', label: 'Balance Transfer' },
  ],
  business: [
    { value: 'working_capital', label: 'Working Capital' },
    { value: 'equipment', label: 'Equipment Purchase' },
    { value: 'expansion', label: 'Business Expansion' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'other', label: 'Other' },
  ],
};

export default function Step1LoanType({ onNext, onPrev, isFirst }) {
  const { step1, setStepData } = useFormStore();
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      loanType: step1.loanType || '',
      loanAmount: step1.loanAmount || '',
      loanTenure: step1.loanTenure || '',
      loanPurpose: step1.loanPurpose || '',
      referralCode: step1.referralCode || '',
    }
  });

  const loanType = watch('loanType');

  // Reset tenure/purpose when loan type changes
  useEffect(() => {
    if (loanType) { setValue('loanTenure', ''); setValue('loanPurpose', ''); }
  }, [loanType]);

  const onSubmit = (data) => {
    setStepData('step1', data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="step-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Loan Type & Details</h2>
        <p className="text-sm text-gray-500 mb-6">Choose your loan type and enter the required amount</p>

        <div className="space-y-5">
          <Controller name="loanType" control={control} render={({ field }) => (
            <RadioGroup
              label="Loan Type"
              required
              name="loanType"
              options={LOAN_TYPES}
              value={field.value}
              onChange={field.onChange}
              error={errors.loanType?.message}
              cardStyle
            />
          )} />

          <Controller name="loanAmount" control={control} render={({ field }) => (
            <CurrencyInput
              label="Loan Amount"
              required
              value={field.value}
              onChange={field.onChange}
              error={errors.loanAmount?.message}
              hint={loanType === 'personal' ? '₹50,000 – ₹10,00,000' : loanType === 'home' ? '₹50,000 – ₹1,00,00,000' : loanType === 'business' ? '₹50,000 – ₹50,00,000' : ''}
            />
          )} />

          <Select
            label="Loan Tenure"
            required
            options={loanType ? TENURE_BY_TYPE[loanType] : []}
            placeholder={loanType ? 'Select tenure' : 'Select loan type first'}
            error={errors.loanTenure?.message}
            disabled={!loanType}
            {...register('loanTenure')}
          />

          <Select
            label="Loan Purpose"
            required
            options={loanType ? PURPOSE_BY_TYPE[loanType] : []}
            placeholder={loanType ? 'Select purpose' : 'Select loan type first'}
            error={errors.loanPurpose?.message}
            disabled={!loanType}
            {...register('loanPurpose')}
          />

          <Input
            label="Referral Code"
            placeholder="Enter referral code (optional)"
            error={errors.referralCode?.message}
            hint="6–10 alphanumeric characters"
            {...register('referralCode')}
          />
        </div>
      </div>

      <StepNavigation onPrev={onPrev} isFirst={isFirst} isLast={false} />
    </form>
  );
}
