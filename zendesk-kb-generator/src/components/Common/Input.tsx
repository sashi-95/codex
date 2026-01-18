import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: { value: string; label: string }[];
}

/**
 * PRADAスタイル 入力フィールドコンポーネント
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label className="prada-label">{label}</label>}
      <input
        className={`prada-input ${error ? 'border-red-600' : ''} ${className}`}
        {...props}
      />
      {error && <p className="error-message">{error}</p>}
      {helpText && !error && <p className="help-text">{helpText}</p>}
    </div>
  );
};

/**
 * PRADAスタイル テキストエリアコンポーネント
 */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label className="prada-label">{label}</label>}
      <textarea
        className={`prada-textarea ${error ? 'border-red-600' : ''} ${className}`}
        {...props}
      />
      {error && <p className="error-message">{error}</p>}
      {helpText && !error && <p className="help-text">{helpText}</p>}
    </div>
  );
};

/**
 * PRADAスタイル セレクトボックスコンポーネント
 */
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helpText,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label className="prada-label">{label}</label>}
      <select
        className={`prada-select ${error ? 'border-red-600' : ''} ${className}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="error-message">{error}</p>}
      {helpText && !error && <p className="help-text">{helpText}</p>}
    </div>
  );
};
