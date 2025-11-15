import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Input from './Input';

describe('Native Input component', () => {
  it('should render correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should call onChangeText when text changes', () => {
    const handleChange = jest.fn();
    render(<Input placeholder="Enter text" onChangeText={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText('Enter text'), { target: { value: 'new text' } });
    expect(handleChange).toHaveBeenCalledWith('new text');
  });

  it('should render with secure text entry for password type', () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });
});
