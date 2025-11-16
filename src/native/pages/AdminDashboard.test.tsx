import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AdminDashboard from './AdminDashboard';

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('AdminDashboard (Native)', () => {
  it('should render admin dashboard', () => {
    const { getByText } = renderWithNavigation(<AdminDashboard />);
    expect(getByText(/admin dashboard/i)).toBeTruthy();
  });

  it('should render school management card', () => {
    const { getByText } = renderWithNavigation(<AdminDashboard />);
    expect(getByText(/school management/i)).toBeTruthy();
  });

  it('should render user management card', () => {
    const { getByText } = renderWithNavigation(<AdminDashboard />);
    expect(getByText(/user management/i)).toBeTruthy();
  });
});
