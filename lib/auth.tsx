import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { authApi, tokenStorage } from './api';
import type { User, AuthState, LoginCredentials } from '@/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  logout: () => Promise<void>;
  checkBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'zyntra_user';
const BIOMETRIC_ENABLED_KEY = 'zyntra_biometric_enabled';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await tokenStorage.getToken();
      const userJson = await SecureStore.getItemAsync(USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authApi.login(credentials);
      const { user, token, refreshToken } = response;

      await tokenStorage.setToken(token);
      await tokenStorage.setRefreshToken(refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const checkBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return compatible && enrolled && enabled === 'true';
    } catch {
      return false;
    }
  }, []);

  const loginWithBiometrics = useCallback(async () => {
    const canUseBiometrics = await checkBiometrics();
    if (!canUseBiometrics) {
      throw new Error('Biometria nao disponivel');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentique-se para acessar o Zyntra',
      fallbackLabel: 'Usar senha',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      throw new Error('Autenticacao biometrica falhou');
    }

    // If biometrics succeed, restore the saved session
    const token = await tokenStorage.getToken();
    const userJson = await SecureStore.getItemAsync(USER_KEY);

    if (token && userJson) {
      const user = JSON.parse(userJson) as User;
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error('Sessao expirada. Faca login novamente.');
    }
  }, [checkBiometrics]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue logout even if API fails
    }

    await tokenStorage.clearTokens();
    await SecureStore.deleteItemAsync(USER_KEY);

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithBiometrics,
        logout,
        checkBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to enable/disable biometrics
export async function setBiometricsEnabled(enabled: boolean) {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function getBiometricsEnabled(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return value === 'true';
}
