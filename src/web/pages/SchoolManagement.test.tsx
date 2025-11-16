import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SchoolManagement from './SchoolManagement';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SchoolManagement', () => {
  it('should render school management page', () => {
    renderWithRouter(<SchoolManagement />);
    expect(screen.getByRole('heading', { name: /schools/i })).toBeInTheDocument();
  });

  it('should show create dialog when create button is clicked', () => {
    renderWithRouter(<SchoolManagement />);
    const createButton = screen.getByText(/create school/i);
    fireEvent.click(createButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/school name/i)).toBeInTheDocument();
  });

  it('should hide create dialog when cancel button is clicked', async () => {
    renderWithRouter(<SchoolManagement />);
    const createButton = screen.getByText(/create school/i);
    fireEvent.click(createButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display no schools message when schools list is empty', () => {
    renderWithRouter(<SchoolManagement />);
    expect(screen.getByText(/no schools found/i)).toBeInTheDocument();
  });
});
