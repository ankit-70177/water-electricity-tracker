import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ onNavigateToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateInputs = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return false;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      const response = await register(name.trim(), email.trim().toLowerCase(), password);

      // Registration was successful.
      // Note: Backend does not return a token on register; user must sign in.
      Alert.alert(
        'Account Created! 🎉',
        response?.message || 'Your account was created successfully. Please sign in.',
        [
          {
            text: 'Sign In',
            onPress: () => onNavigateToLogin(email.trim().toLowerCase()),
          },
        ]
      );
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.brandIcon}>🌱</Text>
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.appTagline}>
            Start tracking and saving your resources today
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join EcoTracker</Text>
          <Text style={styles.cardSubtitle}>
            Enter your details to register a new account
          </Text>

          {errorMessage !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Name Input */}
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#9EB3A5"
            autoCapitalize="words"
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (errorMessage) setErrorMessage('');
            }}
          />

          {/* Email Input */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9EB3A5"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errorMessage) setErrorMessage('');
            }}
          />

          {/* Password Input */}
          <Text style={styles.inputLabel}>Password (min. 6 characters)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9EB3A5"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errorMessage) setErrorMessage('');
            }}
          />

          {/* Confirm Password Input */}
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9EB3A5"
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (errorMessage) setErrorMessage('');
            }}
          />

          {/* Submit Button */}
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          {/* Switch to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => onNavigateToLogin()} disabled={loading}>
              <Text style={styles.footerLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCEBE1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandIcon: {
    fontSize: 28,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#173C2B',
  },
  appTagline: {
    fontSize: 14,
    color: '#6B8273',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#173C2B',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B8273',
    marginTop: 4,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorText: {
    color: '#B71C1C',
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#173C2B',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9FBF9',
    borderWidth: 1,
    borderColor: '#D8E5DC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#173C2B',
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 14,
    color: '#6B8273',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});
