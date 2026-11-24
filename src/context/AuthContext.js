
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the user's session when the app starts
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');

        if (token) {
          const response = await api.get('/api/auth/me');
          setUser(response.data.user);
        }
      } catch (error) {
        console.log(
          'Session restoration failed:',
          error.response?.data?.message || error.message
        );

        // Only clear token if the backend explicitly rejected authentication (401 or 403)
        // Temporary network or tunnel failures should not destroy a valid saved token
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          await SecureStore.deleteItemAsync('authToken');
          setUser(null);
        } else {
          // Keep the token in SecureStore; do not delete on network errors
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });

    return response.data;
  };

  // Login an existing user
  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    await SecureStore.setItemAsync('authToken', token);
    setUser(user);

    return response.data;
  };

  // Logout the current user
  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication functionality
export const useAuth = () => {
  return useContext(AuthContext);
};
