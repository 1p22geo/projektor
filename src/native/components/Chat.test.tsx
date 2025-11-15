import React from 'react';
import { render, screen } from '@testing-library/react';
import Chat from './Chat';

jest.mock('@core/api/socket', () => ({
  getSocket: () => ({
    connected: false,
    connect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }),
}));

describe('Native Chat component', () => {
  it('should render empty state', () => {
    render(<Chat teamId="test-team" />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('should render message input', () => {
    render(<Chat teamId="test-team" />);
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });
});
