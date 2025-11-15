import React from 'react';
import { render, screen } from '@testing-library/react';
import Files from './Files';

describe('Native Files component', () => {
  it('should render empty state', () => {
    render(<Files teamId="test-team" />);
    expect(screen.getByText(/no files uploaded yet/i)).toBeInTheDocument();
  });

  it('should render upload button', () => {
    render(<Files teamId="test-team" />);
    expect(screen.getByText(/upload file/i)).toBeInTheDocument();
  });
});
