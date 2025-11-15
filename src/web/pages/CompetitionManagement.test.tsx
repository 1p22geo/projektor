import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    const createButton = screen.getByText(/create new competition/i);
    fireEvent.click(createButton);
    expect(screen.getByLabelText(/competition name/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max teams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max members per team/i)).toBeInTheDocument();
  });

  it('should hide create form when cancel button is clicked', () => {
    renderWithRouter(<CompetitionManagement />);
    const createButton = screen.getByText(/create new competition/i);
    fireEvent.click(createButton);
    expect(screen.getByLabelText(/competition name/i)).toBeInTheDocument();
    
    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    expect(screen.queryByLabelText(/competition name/i)).not.toBeInTheDocument();
  });

  it('should display no competitions message when list is empty', () => {
    renderWithRouter(<CompetitionManagement />);
    expect(screen.getByText(/no competitions found/i)).toBeInTheDocument();
  });
});
