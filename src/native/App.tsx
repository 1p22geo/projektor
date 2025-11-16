import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import Login from './pages/Login';
import Register from './pages/Register';
import Competitions from './pages/Competitions';
import Team from './pages/Team';
import CreateTeam from './pages/CreateTeam';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SchoolManagement from './pages/SchoolManagement';
import SchoolDetails from './pages/SchoolDetails';
import UserManagement from './pages/UserManagement';
import HeadteacherDashboard from './pages/HeadteacherDashboard';
import CompetitionManagement from './pages/CompetitionManagement';
import Moderation from './pages/Moderation';
import PrivacyPolicy from '@core/pages/PrivacyPolicy';

const Stack = createNativeStackNavigator();

// Dashboard router component
const Dashboard: React.FC = () => {
  const userStr = localStorage.getItem('user'); // localStorage is not directly available in React Native, needs async storage
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!user) {
    // In React Native, you'd navigate using navigation.navigate('Login')
    // For now, we'll just return null or a loading indicator
    return null; 
  }
  
  if (user.role === 'headteacher') {
    return <HeadteacherDashboard />; // This would be a screen in the stack
  }
  
  return <Competitions />; // This would be a screen in the stack
};

// Protected admin route component
const ProtectedAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('authToken'); // localStorage is not directly available in React Native
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!token || !user || user.role !== 'admin') {
    // In React Native, you'd navigate using navigation.navigate('AdminLogin')
    return null;
  }
  
  return children;
};

const App: React.FC = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* Public routes */}
          <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
          <Stack.Screen name="Register" component={Register} options={{ title: 'Register' }} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ title: 'Privacy Policy' }} />
          
          {/* Dashboard route */}
          <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
          
          {/* Admin routes */}
          <Stack.Screen name="AdminLogin" component={AdminLogin} options={{ title: 'Admin Login' }} />
          <Stack.Screen name="AdminDashboard" options={{ title: 'Admin Dashboard' }}>
            {() => <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>}
          </Stack.Screen>
          <Stack.Screen name="SchoolManagement" options={{ title: 'Schools' }}>
            {() => <ProtectedAdminRoute><SchoolManagement /></ProtectedAdminRoute>}
          </Stack.Screen>
          <Stack.Screen name="SchoolDetails" options={{ title: 'School Details' }}>
            {() => <ProtectedAdminRoute><SchoolDetails /></ProtectedAdminRoute>}
          </Stack.Screen>
          <Stack.Screen name="UserManagement" options={{ title: 'Users' }}>
            {() => <ProtectedAdminRoute><UserManagement /></ProtectedAdminRoute>}
          </Stack.Screen>
          
          {/* Headteacher routes */}
          <Stack.Screen name="HeadteacherDashboard" component={HeadteacherDashboard} options={{ title: 'Dashboard' }} />
          <Stack.Screen name="CompetitionManagement" component={CompetitionManagement} options={{ title: 'Competitions' }} />
          <Stack.Screen name="Moderation" component={Moderation} options={{ title: 'Moderation' }} />
          
          {/* Student routes */}
          <Stack.Screen name="Competitions" component={Competitions} options={{ title: 'Competitions' }} />
          <Stack.Screen name="CreateTeam" component={CreateTeam} options={{ title: 'Create Team' }} />
          <Stack.Screen name="Team" component={Team} options={{ title: 'Team' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
