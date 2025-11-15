import React from 'react';
import TextField from '@mui/material/TextField';

interface InputProps {
  label?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  id?: string;
  className?: string;
  style?: any;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  min,
  max,
  id,
  className,
  ...props 
}) => {
  return (
    <TextField
      id={id}
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      fullWidth
      margin="normal"
      variant="outlined"
      inputProps={{ min, max }}
      className={className}
      {...props}
    />
  );
};

export default Input;
