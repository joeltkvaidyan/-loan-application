import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormStore } from '../../store/formStore';
import { step4Schema } from '../../schemas/schemaFactory';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import StepNavigation from '../wizard/StepNavigation';
import { usePinCodeLookup } from '../../hooks/usePinCodeLookup';

const RESIDENCE_TYPES = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'family_owned', label: 'Family Owned' },
  { value: 'company_provided', label: 'Company Provided' },
];

const STATES = ['Andhra Pradesh','Assam','Bihar','Chandigarh','Delhi','Gujarat','Goa','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => ({ value: s, label: s }));

export default function Step4Address({ onNext, onPrev }) {
  const { step4, setStepData } = useFormStore();
  const { lookup } = usePinCodeLookup();
  const [pinLookingUp, setPinLookingUp] = useState(false);
  const [pinError, setPinError] = useState('');
  const [permPinLookingUp, setPermPinLookingUp] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      addressLine1: step4.addressLine1 || '',
      pinCode: step4.pinCode || '',
      city: step4.city || '',
      state: step4.state || '',
      residenceType: step4.residenceType || '',
      rentAmount: step4.rentAmount || '',
      yearsAtAddress: step4.yearsAtAddress || 0,
      prevAddressLine1: step4.prevAddressLine1 || '',
      prevPinCode: step4.prevPinCode || '',
      prevCity: step4.prevCity || '',
      prevState: step4.prevState || '',
      permAddressSame: step4.permAddressSame !== undefined ? step4.permAddressSame : true,
      permAddressLine1: step4.permAddressLine1 || '',
      permPinCode: step4.permPinCode || '',
      permCity: step4.permCity || '',
      permState: step4.permState || '',
    }
  });

  const residenceType = watch('residenceType');
  const yearsAtAddress = watch('yearsAtAddress');
  const permAddressSame = watch('permAddressSame');
  const pinCode = watch('pinCode');

  const lookupPin = async (pin, prefix = '') => {
    if (!/^\d{6}$/.test(pin)) return;
    if (!prefix) { setPinLookingUp(true); setPinError(''); }
    else setPermPinLookingUp(true);
    const result = await lookup(pin);
    if (!prefix) { setPinLookingUp(false); }
    else setPermPinLookingUp(false);
    if (result.found) {
      setValue(`${prefix}city`, result.city);
      setValue(`${prefix}state`, result.state);
      setPinError('');
    } else {
      if (!prefix) setPinError('PIN code not found in database');
    }
  };

  // Copy current to permanent
  const handlePermSameChange = (e) => {
    const checked = e.target.checked;
    setValue('permAddressSame', checked);
    if (checked) {
      const curr = { addressLine1: watch('addressLine1'), pinCode: watch('pinCode'), city: watch('city'), state: watch('state') };
      setValue('permAddressLine1', curr.addressLine1);
      setValue('permPinCode', curr.pinCode);
      setValue('permCity', curr.city);
      setValue('permState', curr.state);
    }
  };

  const onSubmit = (data) => {
    setStepData('step4', data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="step-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Address Details</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your current residential address</p>

        <div className="space-y-5">
          <Input label="Address Line 1" required placeholder="House No, Street, Area" error={errors.addressLine1?.message} {...register('addressLine1')} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="PIN Code"
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit PIN"
                error={errors.pinCode?.message || pinError}
                hint={pinLookingUp ? 'Looking up…' : ''}
                {...register('pinCode', { onBlur: e => lookupPin(e.target.value) })}
              />
            </div>
            <Input label="City" required error={errors.city?.message} {...register('city')} />
            <Select label="State" required options={STATES} error={errors.state?.message} {...register('state')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Residence Type" required options={RESIDENCE_TYPES} error={errors.residenceType?.message} {...register('residenceType')} />
            {residenceType === 'rented' && (
              <Controller name="rentAmount" control={control} render={({ field }) => (
                <CurrencyInput label="Monthly Rent" required value={field.value} onChange={field.onChange} error={errors.rentAmount?.message} />
              )} />
            )}
          </div>

          <Input label="Years at Current Address" required type="number" min="0" max="50" error={errors.yearsAtAddress?.message} {...register('yearsAtAddress')} />

          {/* Previous address if < 1 year */}
          {Number(yearsAtAddress) < 1 && (
            <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-3">Previous Address (required — less than 1 year at current address)</p>
              <div className="space-y-3">
                <Input label="Previous Address Line 1" error={errors.prevAddressLine1?.message} {...register('prevAddressLine1')} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="PIN Code" maxLength={6} error={errors.prevPinCode?.message} {...register('prevPinCode')} />
                  <Input label="City" error={errors.prevCity?.message} {...register('prevCity')} />
                  <Select label="State" options={STATES} error={errors.prevState?.message} {...register('prevState')} />
                </div>
              </div>
            </div>
          )}

          {/* Permanent Address */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="permSame"
                className="accent-blue-600 w-4 h-4"
                {...register('permAddressSame')}
                onChange={handlePermSameChange}
              />
              <label htmlFor="permSame" className="text-sm font-medium text-gray-700">
                Permanent address same as current address
              </label>
            </div>

            {!permAddressSame && (
              <div className="space-y-3">
                <Input label="Permanent Address Line 1" required error={errors.permAddressLine1?.message} {...register('permAddressLine1')} />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="PIN Code" maxLength={6} required error={errors.permPinCode?.message}
                    {...register('permPinCode', { onBlur: e => lookupPin(e.target.value, 'perm') })} />
                  <Input label="City" required error={errors.permCity?.message} {...register('permCity')} />
                  <Select label="State" required options={STATES} error={errors.permState?.message} {...register('permState')} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <StepNavigation onPrev={onPrev} isFirst={false} isLast={false} />
    </form>
  );
}
