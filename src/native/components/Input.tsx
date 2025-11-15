import React from 'react';
import { TextInput } from 'react-native-paper';

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
}

const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  onChangeText,
  placeholder,
  ...props 
}) => {
  const secureTextEntry = type === 'password';
  const keyboardType = type === 'email' ? 'email-address' : 
                       type === 'number' ? 'numeric' : 'default';

  return (
    <TextInput
      label={label}
      value={String(value || '')}
      onChangeText={onChangeText || ((text) => onChange?.({ target: { value: text } } as any))}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      mode="outlined"
      style={{ marginVertical: 8 }}
      {...props}
    />
  );
};

export default Input;
