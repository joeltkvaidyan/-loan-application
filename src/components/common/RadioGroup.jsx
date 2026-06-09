import React, { forwardRef } from 'react';

const RadioGroup = forwardRef(function RadioGroup(
  { label, error, required, options = [], value, onChange, name, wrapperClass = '', cardStyle = false },
  ref
) {
  return (
    <div className={`w-full ${wrapperClass}`} role="group" aria-labelledby={`rg-${name}`}>
      {label && (
        <p id={`rg-${name}`} className="field-label">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div className={cardStyle ? 'grid grid-cols-1 sm:grid-cols-3 gap-3' : 'flex flex-wrap gap-4'}>
        {options.map(opt => (
          <label
            key={opt.value}
            className={cardStyle
              ? `flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all min-h-[44px] ${value === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`
              : `flex items-center gap-2 cursor-pointer min-h-[44px]`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={e => onChange && onChange(e.target.value)}
              className="mt-0.5 accent-blue-600 w-4 h-4 shrink-0"
              ref={ref}
            />
            <div>
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              {opt.description && <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" aria-live="polite" className="error-msg mt-1">{error}</p>
      )}
    </div>
  );
});

export default RadioGroup;
