import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  onPress?: () => void;
  style?: any;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  onPress,
  disabled = false,
  style,
  ...props 
}) => {
  const mode = variant === 'secondary' ? 'outlined' : 'contained';
  const buttonColor = variant === 'danger' ? '#d32f2f' : undefined;

  return (
    <PaperButton
      mode={mode}
      onPress={onPress || onClick}
      disabled={disabled}
      buttonColor={buttonColor}
      style={[{ marginVertical: 8 }, style]}
      {...props}
    >
      {children}
    </PaperButton>
  );
};

export default Button;
