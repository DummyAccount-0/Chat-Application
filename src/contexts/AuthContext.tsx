import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  teams: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { user: null, token: null, loading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.getCurrentUser();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: localStorage.getItem('token') }
      });
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_REQUEST' });
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token }
      });
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    dispatch({ type: 'AUTH_REQUEST' });
    try {
      const response = await authService.register(username, email, password);
      localStorage.setItem('token', response.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token }
      });
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};