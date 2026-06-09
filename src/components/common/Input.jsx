import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, required, hint, className = '', wrapperClass = '', id, ...props },
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
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
        {...props}
      />
      {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && (
        <p id={`${inputId}-error`} role="alert" aria-live="polite" className="error-msg">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
