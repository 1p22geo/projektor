import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@platform/pages/Login';
import Register from '@platform/pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Competitions from '@platform/pages/Competitions';

// Mock all the hooks that pages use
jest.mock('@core/hooks/auth/useLogin', () => ({
  __esModule: true,
  default: () => ({
    login: jest.fn(),
    error: null,
    loading: false,
  }),
}));

jest.mock('@core/hooks/auth/useLoginAdmin', () => ({
  __esModule: true,
  default: () => ({
    login: jest.fn(),
    error: null,
    loading: false,
  }),
}));

jest.mock('@core/api/socket', () => ({
  getSocket: () => ({
    connected: false,
    connect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }),
}));

jest.mock('@core/api/apiClient', () => ({
  default: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn(),
  },
}));

describe('App pages', () => {
  it('should render login page', () => {
    render(<Login />, { wrapper: BrowserRouter });
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
  });

  it('should render register page', () => {
    render(<Register />, { wrapper: BrowserRouter });
    expect(screen.getByText(/student registration/i)).toBeInTheDocument();
  });

  it('should render admin login page', () => {
    render(<AdminLogin />, { wrapper: BrowserRouter });
    expect(screen.getByText(/admin login/i)).toBeInTheDocument();
  });

  it('should render admin dashboard', () => {
    render(<AdminDashboard />, { wrapper: BrowserRouter });
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });

  it('should render competitions page', () => {
    render(<Competitions />, { wrapper: BrowserRouter });
    expect(screen.getByText(/available competitions/i)).toBeInTheDocument();
  });
});


