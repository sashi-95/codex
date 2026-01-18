import React from 'react';
import type { MultiLangText } from '../../types/article';
import { Input, TextArea } from './Input';

interface MultiLangInputProps {
  label: string;
  value: MultiLangText;
  onChange: (value: MultiLangText) => void;
  type?: 'input' | 'textarea';
  placeholder?: MultiLangText;
  error?: MultiLangText;
  required?: boolean;
}

/**
 * 3言語対応入力コンポーネント
 */
export const MultiLangInput: React.FC<MultiLangInputProps> = ({
  label,
  value,
  onChange,
  type = 'input',
  placeholder,
  error,
  required = false,
}) => {
  const handleChange = (lang: keyof MultiLangText, newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue,
    });
  };

  const InputComponent = type === 'textarea' ? TextArea : Input;

  return (
    <div className="form-group">
      <label className="prada-label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="form-group-inline">
        <InputComponent
          label="English"
          value={value.en}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            handleChange('en', e.target.value)
          }
          placeholder={placeholder?.en}
          error={error?.en}
          required={required}
        />
        <InputComponent
          label="日本語"
          value={value.ja}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            handleChange('ja', e.target.value)
          }
          placeholder={placeholder?.ja}
          error={error?.ja}
          required={required}
        />
        <InputComponent
          label="Português"
          value={value.pt}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            handleChange('pt', e.target.value)
          }
          placeholder={placeholder?.pt}
          error={error?.pt}
          required={required}
        />
      </div>
    </div>
  );
};
