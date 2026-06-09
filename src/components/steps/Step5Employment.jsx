import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { step5Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import CurrencyInput from '../common/CurrencyInput';
import StepNavigation from '../wizard/StepNavigation';

const TABS = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
];

export default function Step5Employment({ onNext, onPrev }) {
  const { step1, step5, setStepData } = useFormStore();
  const [empType, setEmpType] = React.useState(step5.employmentType || 'salaried');

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(step5Schema),
    defaultValues: step5.employmentType ? step5 : { employmentType: 'salaried' },
  });

  const handleTabChange = (type) => {
    setEmpType(type);
    reset({ employmentType: type });
  };

  // Force business loan to only allow self_employed or business_owner
  const isBizLoan = step1.loanType === 'business';

  const onSubmit = (data) => {
    setStepData('step5', data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="step-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Employment & Income</h2>
        <p className="text-sm text-gray-500 mb-6">
          {isBizLoan ? 'Business loans require Self-Employed or Business Owner status' : 'Select your employment type'}
        </p>

        {/* Employment type tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6" role="tablist">
          {TABS.map(tab => {
            const disabled = isBizLoan && tab.value === 'salaried';
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={empType === tab.value}
                disabled={disabled}
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px]
                  ${empType === tab.value ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <input type="hidden" {...register('employmentType')} value={empType} />

        <div className="space-y-5">
          {empType === 'salaried' && (
            <>
              <Input label="Company Name" required error={errors.companyName?.message} {...register('companyName')} />
              <Controller name="monthlyIncome" control={control} render={({ field }) => (
                <CurrencyInput label="Monthly Salary (Net Take-Home)" required value={field.value}
                  onChange={field.onChange} error={errors.monthlyIncome?.message} hint="Minimum ₹15,000" />
              )} />
              <Input label="Years in Current Job" required type="number" min="0" max="50"
                error={errors.yearsInJob?.message} {...register('yearsInJob')} />
            </>
          )}

          {empType === 'self_employed' && (
            <>
              <Input label="Business / Practice Name" required error={errors.businessName?.message} {...register('businessName')} />
              <Controller name="annualTurnover" control={control} render={({ field }) => (
                <CurrencyInput label="Annual Turnover / Income" required value={field.value}
                  onChange={field.onChange} error={errors.annualTurnover?.message} hint="Minimum ₹3,00,000" />
              )} />
              <Input label="Years in Business / Practice" required type="number" min="0"
                error={errors.yearsInBusiness?.message} hint="Minimum 2 years" {...register('yearsInBusiness')} />
            </>
          )}

          {empType === 'business_owner' && (
            <>
              <Input label="Business Name" required error={errors.businessName?.message} {...register('businessName')} />
              <Controller name="annualTurnover" control={control} render={({ field }) => (
                <CurrencyInput label="Annual Turnover" required value={field.value}
                  onChange={field.onChange} error={errors.annualTurnover?.message} hint="Minimum ₹3,00,000" />
              )} />
              <Input label="GST Number" required placeholder="22AAAAA0000A1Z5"
                error={errors.gstNumber?.message} hint="15-character GST registration number"
                {...register('gstNumber')} />
              <Input label="Years in Business" required type="number" min="0"
                error={errors.yearsInBusiness?.message} hint="Minimum 2 years" {...register('yearsInBusiness')} />
            </>
          )}
        </div>
      </div>

      <StepNavigation onPrev={onPrev} isFirst={false} isLast={false} />
    </form>
  );
}
