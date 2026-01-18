import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary';
  children: React.ReactNode;
}

/**
 * PRADAスタイル ボタンコンポーネント
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const baseClass = variant === 'primary' ? 'prada-button-primary' : 'prada-button';

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
