import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SocketContext, socket } from './components/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './components/login';
import Home from './components/home';
import Store from './components/store';
import Chatbox from './components/chatbox';
import PreBuiltChat from './components/prebuiltChat';
const Stack = createNativeStackNavigator();


async function getLoggedIn() {
  // const token = await AsyncStorage.getItem('token');
  const token = sessionStorage.getItem('token');
  if (token) return true;
  return false;
}

export default function App() {

  const auth = getLoggedIn();

  return auth ? (
    <SocketContext.Provider value={socket}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false }} name="Home" component={Home} />
          <Stack.Screen options={{ headerShown: false }} name="Login" component={Login} />
          <Stack.Screen options={{ headerShown: false }} name="Chat" component={PreBuiltChat} />
          <Stack.Screen options={{ headerShown: false }} name="Store" component={Store} />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketContext.Provider>
  ) : (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{ headerShown: false }} name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}