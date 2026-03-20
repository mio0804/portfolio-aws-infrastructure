import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = async () => {
    try {
      await logout();
      
      // Mock認証の場合のみ手動でナビゲーション
      // Cognito認証の場合は自動リダイレクトに任せる
      if (import.meta.env.VITE_USE_COGNITO !== 'true') {
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error in Layout:', error);
      // エラーが発生した場合も手動でログイン画面に遷移
      navigate('/login');
    }
  };

  // 現在のパスをチェックして該当するナビゲーションリンクを非表示にする
  const isPetsPage = location.pathname.startsWith('/pets');
  const isDiariesPage = location.pathname.startsWith('/diaries');

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">AnimaLog</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {!isPetsPage && <Nav.Link as={Link} to="/pets">ペット一覧</Nav.Link>}
              {!isDiariesPage && <Nav.Link as={Link} to="/diaries">日記一覧</Nav.Link>}
            </Nav>
            <Nav>
              {user && (
                <>
                  <Nav.Link as={Link} to="/profile" className="me-3">
                    {user.username}
                  </Nav.Link>
                  <Button variant="outline-light" size="sm" onClick={handleLogout}>
                    ログアウト
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid="sm" className="mt-4 px-3">
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;