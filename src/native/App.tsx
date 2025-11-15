import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import Login from './pages/Login';
import Register from './pages/Register';
import Competitions from './pages/Competitions';
import Team from './pages/Team';
import CreateTeam from './pages/CreateTeam';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
          <Stack.Screen name="Register" component={Register} options={{ title: 'Register' }} />
          <Stack.Screen name="Competitions" component={Competitions} options={{ title: 'Competitions' }} />
          <Stack.Screen name="CreateTeam" component={CreateTeam} options={{ title: 'Create Team' }} />
          <Stack.Screen name="Team" component={Team} options={{ title: 'Team' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
