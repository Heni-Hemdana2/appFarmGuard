import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';

// Import des écrans
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import AlertScreen from './screens/AlerteScreen';
import DetectionScreen from './screens/DetectionScreen'; // Nouvel import

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50', // Couleur pour FarmGuard (vert)
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: "Connexion", headerShown: false }}
        />
        <Stack.Screen 
          name="Alert" 
          component={AlertScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Detection" 
          component={DetectionScreen} 
          options={{ 
            title: "Détection",
            headerShown: false // On cache l'en-tête car on gère notre propre header dans l'écran
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});