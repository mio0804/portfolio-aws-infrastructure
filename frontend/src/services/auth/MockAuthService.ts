// 開発環境用のモック認証サービス

import { type AuthService, type User } from './types.ts';
import { logger } from '../../utils/logger';

export class MockAuthService implements AuthService {
  private mockUser: User = {
    id: 'test-user-123',
    email: 'test@example.com',
    username: 'テストユーザー',
    created_at: new Date().toISOString()
  };

  async initialize(): Promise<void> {
    logger.log('MockAuthService initialized');
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('mock_token');
    return token ? this.mockUser : null;
  }

  async signIn(): Promise<void> {
    // 開発環境では即座にログイン
    localStorage.setItem('mock_token', 'mock-development-token');
    window.location.href = '/';
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('mock_token');
    window.location.href = '/login';
  }

  async handleCallback(code: string): Promise<void> {
    // 開発環境ではコールバック処理は不要
    logger.log('Mock callback handler called with code:', code);
  }

  async getIdToken(): Promise<string | null> {
    return localStorage.getItem('mock_token');
  }
}