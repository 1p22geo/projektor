import React from 'react';
import MuiButton from '@mui/material/Button';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  onPress?: () => void;
  style?: any;
  form?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  onPress,
  type = 'button',
  disabled = false,
  className,
  style,
  form,
  ...props 
}) => {
  const muiVariant = variant === 'primary' ? 'contained' : 
                     variant === 'secondary' ? 'outlined' : 'contained';
  const color = variant === 'danger' ? 'error' : 'primary';

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      onClick={onClick || onPress}
      type={type}
      disabled={disabled}
      className={className}
      sx={style}
      form={form}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
