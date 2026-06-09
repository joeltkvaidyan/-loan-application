import React, { forwardRef } from 'react';

const Select = forwardRef(function Select(
  { label, error, required, options = [], placeholder = 'Select...', wrapperClass = '', id, ...props },
  ref
) {
  const inputId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={`w-full ${wrapperClass}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`form-input bg-white ${error ? 'form-input-error' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p id={`${inputId}-error`} role="alert" aria-live="polite" className="error-msg">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
