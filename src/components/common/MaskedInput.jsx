import React, { forwardRef, useState } from 'react';

const MaskedInput = forwardRef(function MaskedInput(
  { label, error, required, maskLast = 4, value, onChange, wrapperClass = '', id, verified, hint, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);
  const inputId = id || `field-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  const displayValue = !focused && value && value.length > maskLast
    ? '·'.repeat(value.length - maskLast) + value.slice(-maskLast)
    : (value || '');

  return (
    <div className={`w-full ${wrapperClass}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label} {required && <span className="text-red-500">*</span>}
          {verified === true && (
            <span className="verify-badge bg-green-100 text-green-700 ml-2">✓ Verified</span>
          )}
          {verified === false && value && (
            <span className="verify-badge bg-red-100 text-red-700 ml-2">✗ Failed</span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type="text"
        value={displayValue}
        onChange={e => {
          if (focused) const val = e.target.value;
          onChange && onChange(/[a-zA-Z]/g.test(val) ? val.toUpperCase() : val);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`form-input font-mono tracking-wider ${error ? 'form-input-error' : ''}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && (
        <p id={`${inputId}-error`} role="alert" aria-live="polite" className="error-msg">
          {error}
        </p>
      )}
    </div>
  );
});

export default MaskedInput;
