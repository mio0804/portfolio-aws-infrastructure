import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await login();
      navigate('/');
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">AnimaLog</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <p className="text-muted mb-4">
            開発環境では、下のボタンをクリックするだけでログインできます。
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-100"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
          <p className="text-muted mt-3 text-center small">
            本番環境では Amazon Cognito による認証が必要です
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;