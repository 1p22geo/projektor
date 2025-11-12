import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, Button as RNButton } from 'react-native'; // Use RNButton to avoid conflict with core Button
import Button from '@core/components/Button'; // Example shared component
import Input from '@core/components/Input';   // Example shared component

const Stack = createNativeStackNavigator();

import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const HomeScreen = ({ navigation }: HomeScreenProps) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Mobile Home Screen</Text>
    <Button onPress={() => navigation.navigate('Details')}>Go to Details</Button>
    <Input label="Mobile Input" />
  </View>
);

const DetailsScreen = ({ navigation }: DetailsScreenProps) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Details Screen</Text>
    <RNButton title="Go back" onPress={() => navigation.goBack()} />
  </View>
);

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
