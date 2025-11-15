import React from 'react';
import { render, screen } from '@testing-library/react';
import Files from './Files';

jest.mock('@core/api/apiClient', () => ({
  default: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn(),
  },
}));

describe('Files component', () => {
  it('should render empty state', () => {
    render(<Files teamId="test-team" />);
    expect(screen.getByText(/no files uploaded yet/i)).toBeInTheDocument();
  });

  it('should render upload button', () => {
    render(<Files teamId="test-team" />);
    expect(screen.getByText(/upload file/i)).toBeInTheDocument();
  });
});
