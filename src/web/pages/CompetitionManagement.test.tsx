import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompetitionManagement from './CompetitionManagement';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CompetitionManagement', () => {
  it('should render competition management page', () => {
    renderWithRouter(<CompetitionManagement />);
    expect(screen.getByText(/competition management/i)).toBeInTheDocument();
  });

  it('should show create form when create button is clicked', () => {
    renderWithRouter(<CompetitionManagement />);
    const createButton = screen.getByRole('button', { name: /create competition/i });
    fireEvent.click(createButton);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText(/competition name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max teams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max members per team/i)).toBeInTheDocument();
  });

  it('should hide create form when cancel button is clicked', async () => {
    renderWithRouter(<CompetitionManagement />);
    const createButton = screen.getByRole('button', { name: /create competition/i });
    fireEvent.click(createButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display no competitions message when list is empty', () => {
    renderWithRouter(<CompetitionManagement />);
    expect(screen.getByText(/no competitions found/i)).toBeInTheDocument();
  });
});
