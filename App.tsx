import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { loadPersistedState } from './src/store/index-react-native';
import './src/i18n/config'; // Initialize i18n

export default function App() {
  useEffect(() => {
    loadPersistedState(); // Call load function on mount
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
