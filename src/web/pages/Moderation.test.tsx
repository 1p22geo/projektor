import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Moderation from './Moderation';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Moderation', () => {
  it('should render moderation page', () => {
    renderWithRouter(<Moderation />);
    expect(screen.getByText(/team moderation/i)).toBeInTheDocument();
  });

  it('should display table headers', () => {
    renderWithRouter(<Moderation />);
    expect(screen.getByText(/team name/i)).toBeInTheDocument();
    expect(screen.getByText(/competition/i)).toBeInTheDocument();
    expect(screen.getByText(/members/i)).toBeInTheDocument();
  });

  it('should display no teams message when teams list is empty', () => {
    renderWithRouter(<Moderation />);
    expect(screen.getByText(/no teams found/i)).toBeInTheDocument();
  });
});
