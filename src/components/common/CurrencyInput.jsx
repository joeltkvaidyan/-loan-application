import React, { forwardRef, useState } from 'react';
import { formatINR, parseCurrency } from '../../utils/emiCalculator';

const CurrencyInput = forwardRef(function CurrencyInput(
  { label, error, required, value, onChange, wrapperClass = '', id, hint, ...props },
  ref
) {
  const inputId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const [focused, setFocused] = useState(false);

  const displayValue = focused ? (value || '') : (value ? formatINR(value) : '');

  return (
    <div className={`w-full ${wrapperClass}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={e => {
            const raw = parseCurrency(e.target.value);
            onChange && onChange(raw);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`form-input pl-7 ${error ? 'form-input-error' : ''}`}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && (
        <p id={`${inputId}-error`} role="alert" aria-live="polite" className="error-msg">
          {error}
        </p>
      )}
    </div>
  );
});

export default CurrencyInput;
