import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // AWS Amplifyが自動的にコールバックを処理
      // 認証状態を更新してホーム画面へ遷移
      try {
        logger.log('Callback: Starting authentication refresh...');
        await refreshAuth();
        
        // 少し待機してから遷移（状態更新を確実にするため）
        setTimeout(() => {
          logger.log('Callback: Navigating to home...');
          navigate('/');
        }, 100);
      } catch (error) {
        logger.error('Callback error:', error);
        navigate('/login');
      }
    };

    // 少し遅延させてAmplifyの処理を確実に完了させる
    const timer = setTimeout(handleCallback, 200);
    
    return () => clearTimeout(timer);
  }, [navigate, refreshAuth]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">認証処理中...</span>
        </Spinner>
        <p>認証処理中です。しばらくお待ちください...</p>
      </div>
    </Container>
  );
};

export default Callback;