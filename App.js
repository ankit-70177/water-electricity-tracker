import React, { useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';

function MainNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'
  const [prefillEmail, setPrefillEmail] = useState('');

  // Show a clean branded loading screen while checking SecureStore session
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <View style={styles.iconCircle}>
          <Text style={styles.brandIcon}>💧⚡</Text>
        </View>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading EcoTracker...</Text>
      </View>
    );
  }

  // If not authenticated, switch between Login and Register
  if (!isAuthenticated) {
    if (authScreen === 'register') {
      return (
        <RegisterScreen
          onNavigateToLogin={(email) => {
            setPrefillEmail(email || '');
            setAuthScreen('login');
          }}
        />
      );
    }
    return (
      <LoginScreen
        initialEmail={prefillEmail}
        onNavigateToRegister={() => {
          setPrefillEmail('');
          setAuthScreen('register');
        }}
      />
    );
  }

  // Authenticated: display the full existing dashboard
  return <DashboardScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8F5',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCEBE1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandIcon: {
    fontSize: 30,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#6B8273',
    fontWeight: '500',
  },
});
