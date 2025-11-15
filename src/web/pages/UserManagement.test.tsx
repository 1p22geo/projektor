import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from './UserManagement';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UserManagement', () => {
  it('should render user management page', () => {
    renderWithRouter(<UserManagement />);
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
  });

  it('should display table headers', () => {
    renderWithRouter(<UserManagement />);
    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByText(/school/i)).toBeInTheDocument();
  });

  it('should display no users message when users list is empty', () => {
    renderWithRouter(<UserManagement />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });
});
