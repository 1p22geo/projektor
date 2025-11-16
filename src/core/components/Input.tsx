import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface CustomInputProps extends TextFieldProps {
  // Add any custom props here if needed
}

const Input: React.FC<CustomInputProps> = ({ ...props }) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      {...props}
    />
  );
};

export default Input;
