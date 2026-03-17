import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">読み込み中...</p>
      </Container>
    );
  }

  // ログアウト中はリダイレクトを行わず、Cognitoの自動リダイレクトに任せる
  if (!user && !isLoggingOut) {
    return <Navigate to="/login" replace />;
  }

  // ログアウト中で且つユーザーがnullの場合は何も表示しない（Cognitoがリダイレクト処理中）
  if (!user && isLoggingOut) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">ログアウト中...</p>
      </Container>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;