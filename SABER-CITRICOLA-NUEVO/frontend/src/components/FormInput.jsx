// 📝 FormInput.jsx - Componente de input con validación
import React from 'react';
import './FormInput.css';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  placeholder,
  disabled = false,
  required = false,
  icon,
  helpText,
  onChange,
  onBlur,
  className = '',
  ...props
}) => {
  const inputId = `input-${name}`;
  const hasError = touched && error;

  const getInputClassName = () => {
    let className = 'form-input';
    if (hasError) className += ' form-input--error';
    if (disabled) className += ' form-input--disabled';
    if (icon) className += ' form-input--with-icon';
    return className;
  };

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {icon && <span className="form-label-icon">{icon}</span>}
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      
      <div className="form-input-container">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClassName()}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          {...props}
        />
        
        {hasError && (
          <div className="form-error-icon">
            ⚠️
          </div>
        )}
      </div>

      {hasError && (
        <div id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}

      {helpText && !hasError && (
        <div className="form-help">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default FormInput;