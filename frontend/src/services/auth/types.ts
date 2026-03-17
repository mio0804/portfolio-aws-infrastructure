// 認証サービスの共通型定義

export interface User {
  id: string;
  email: string;
  username: string;
  created_at?: string;
}

export interface AuthService {
  // 現在のユーザーを取得
  getCurrentUser(): Promise<User | null>;
  
  // ログイン（Cognitoホステッドログインページへリダイレクト）
  signIn(): Promise<void>;
  
  // ログアウト
  signOut(): Promise<void>;
  
  // 認証コールバック処理
  handleCallback(code: string): Promise<void>;
  
  // トークンを取得（APIリクエスト用）
  getIdToken(): Promise<string | null>;
  
  // 初期化
  initialize(): Promise<void>;
}

