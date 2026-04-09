import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createAuthService, type AuthService, type User } from '../services/auth/index.ts';
import { authAPI } from '../services/api';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authService] = useState<AuthService>(() => createAuthService());

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('VITE_USE_COGNITO:', import.meta.env.VITE_USE_COGNITO);
      console.log('VITE_COGNITO_USER_POOL_ID:', import.meta.env.VITE_COGNITO_USER_POOL_ID);
      console.log('VITE_COGNITO_CLIENT_ID:', import.meta.env.VITE_COGNITO_CLIENT_ID);
      console.log('VITE_COGNITO_DOMAIN:', import.meta.env.VITE_COGNITO_DOMAIN);
      console.log('VITE_COGNITO_REDIRECT_URI:', import.meta.env.VITE_COGNITO_REDIRECT_URI);
      console.log('VITE_COGNITO_LOGOUT_URI:', import.meta.env.VITE_COGNITO_LOGOUT_URI);
      // 認証サービスの初期化
      await authService.initialize();
      setIsInitialized(true);
      
      // 現在のユーザーを取得
      await checkAuth();
    } catch (error) {
      console.error('認証の初期化に失敗しました:', error);
      setIsInitialized(true);
      // 初期化に失敗してもcheckAuthを実行して、最終的にisLoadingをfalseにする
      await checkAuth();
    }
  };

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // バックエンドからユーザー情報を取得（データベースの情報と同期）
        try {
          const token = await authService.getIdToken();
          if (token) {
            // 既存のAPIインターセプターがトークンを設定
            localStorage.setItem('token', token);
            const response = await authAPI.getMe();
            setUser(response.user);
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          // バックエンドが利用できない場合はCognitoの情報を使用
          logger.log('Cognitoユーザー情報を使用:', currentUser);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      logger.error('認証確認に失敗しました:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      await authService.signIn();
    } catch (error) {
      logger.error('ログインに失敗しました:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Cognito使用時はリダイレクトが発生する前に状態をクリア
      if (import.meta.env.VITE_USE_COGNITO === 'true') {
        localStorage.removeItem('token');
        setUser(null);
      }
      
      await authService.signOut();
      
      // Mock認証の場合はここで状態をクリア
      if (import.meta.env.VITE_USE_COGNITO !== 'true') {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggingOut(false);
      }
      // Cognito環境ではリダイレクト後にページがリロードされるため、isLoggingOutは自動的にリセットされる
    } catch (error) {
      logger.error('ログアウトに失敗しました:', error);
      // エラーが発生してもローカルの状態はクリア
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  const refreshAuth = async () => {
    // 初期化が完了していない場合は待機
    if (!isInitialized) {
      return;
    }
    setIsLoading(true);
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggingOut, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};