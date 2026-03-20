import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container>
      <div className="text-center mb-5">
        <h1>AnimaLogへようこそ！</h1>
        <p className="lead">あなたの大切なペットとの思い出を記録しましょう</p>
      </div>

      <Row className="mb-4">
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h5>ペット管理</h5>
              <p>大切なペットの情報を登録・管理できます</p>
              <Link to="/pets" className="d-grid">
                <Button variant="primary" size="lg">ペット一覧</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h5>日記投稿</h5>
              <p>ペットとの日々の出来事を写真付きで記録</p>
              <Link to="/diaries/new" className="d-grid">
                <Button variant="primary" size="lg">日記を書く</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h5>思い出を振り返る</h5>
              <p>投稿した日記を時系列で振り返れます</p>
              <Link to="/diaries" className="d-grid">
                <Button variant="primary" size="lg">日記一覧</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {user && (
        <div className="text-center">
          <h3>こんにちは、{user.username}さん！</h3>
          <p>今日もペットとの素敵な時間を記録しませんか？</p>
        </div>
      )}
    </Container>
  );
};

export default Home;