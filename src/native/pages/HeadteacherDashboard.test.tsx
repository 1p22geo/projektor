import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HeadteacherDashboard from './HeadteacherDashboard';

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('HeadteacherDashboard (Native)', () => {
  it('should render dashboard', () => {
    const { getByText } = renderWithNavigation(<HeadteacherDashboard />);
    expect(getByText(/dashboard/i)).toBeTruthy();
  });

  it('should render token generation section', () => {
    const { getByText } = renderWithNavigation(<HeadteacherDashboard />);
    expect(getByText(/generate tokens/i)).toBeTruthy();
  });

  it('should render competitions card', () => {
    const { getByText } = renderWithNavigation(<HeadteacherDashboard />);
    expect(getByText(/competitions/i)).toBeTruthy();
  });

  it('should render moderation card', () => {
    const { getByText } = renderWithNavigation(<HeadteacherDashboard />);
    expect(getByText(/team moderation/i)).toBeTruthy();
  });
});
