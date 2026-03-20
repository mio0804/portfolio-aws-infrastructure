import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { petsAPI, diariesAPI } from '../services/api';
import type { Pet } from '../types/index.js';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState({
    totalPets: 0,
    totalDiaries: 0,
    recentDiaries: 0
  });
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // ペット一覧を取得
      const petsResponse = await petsAPI.getAll();
      setPets(petsResponse.pets);
      
      // 統計情報を計算
      const totalPets = petsResponse.pets.length;
      let totalDiaries = 0;
      let recentDiaries = 0;
      
      // 各ペットの日記数を集計
      for (const pet of petsResponse.pets) {
        if (pet.diary_count !== undefined) {
          totalDiaries += pet.diary_count;
        }
      }
      
      // 最近30日の日記数を取得（簡易的に全日記から計算）
      try {
        const diariesResponse = await diariesAPI.getAll(1); // ページ1を取得
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        recentDiaries = diariesResponse.diaries.filter((diary: any) => 
          new Date(diary.created_at) > thirtyDaysAgo
        ).length;
      } catch (err) {
        console.error('Failed to fetch recent diaries:', err);
      }
      
      setStats({
        totalPets,
        totalDiaries,
        recentDiaries
      });
      
    } catch (err) {
      setError('ユーザー情報の取得に失敗しました');
      console.error('Failed to fetch user data:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const getMostActivePet = () => {
    if (pets.length === 0) return null;
    return pets.reduce((most, pet) => 
      (pet.diary_count || 0) > (most.diary_count || 0) ? pet : most
    );
  };

  const mostActivePet = getMostActivePet();

  return (
    <Container>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-column flex-md-row gap-3">
          <h2 className="mb-0">ユーザープロフィール</h2>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/">
              <Button variant="secondary" size="sm">ホームに戻る</Button>
            </Link>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h4>基本情報</h4>
            </Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-4">ユーザー名</dt>
                <dd className="col-sm-8">{user?.username || 'ゲストユーザー'}</dd>
                
                <dt className="col-sm-4">メールアドレス</dt>
                <dd className="col-sm-8">{user?.email || 'test@example.com'}</dd>
                
                <dt className="col-sm-4">ユーザーID</dt>
                <dd className="col-sm-8">
                  <code className="small">{user?.id || 'guest'}</code>
                </dd>
                
                <dt className="col-sm-4">アカウント種別</dt>
                <dd className="col-sm-8">
                  <Badge bg="info">開発環境ユーザー</Badge>
                </dd>
              </dl>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4>統計情報</h4>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <h3 className="text-primary">{stats.totalPets}</h3>
                  <p className="text-muted mb-0">登録ペット数</p>
                </Col>
                <Col>
                  <h3 className="text-primary">{stats.totalDiaries}</h3>
                  <p className="text-muted mb-0">総日記数</p>
                </Col>
                <Col>
                  <h3 className="text-primary">{stats.recentDiaries}</h3>
                  <p className="text-muted mb-0">最近30日の日記</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h4>ペット一覧</h4>
            </Card.Header>
            <Card.Body>
              {pets.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted mb-3">まだペットが登録されていません</p>
                  <Link to="/pets/new">
                    <Button variant="primary">最初のペットを登録</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {pets.map((pet) => (
                    <Card key={pet.id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start flex-column flex-sm-row gap-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{pet.name}</h6>
                            <p className="text-muted small mb-0">
                              {pet.species}
                              {pet.breed && ` • ${pet.breed}`}
                            </p>
                            <p className="text-muted small mb-0">
                              日記: {pet.diary_count || 0}件
                            </p>
                          </div>
                          <div className="d-flex gap-2 flex-wrap mt-2">
                            <Link to={`/pets/${pet.id}`}>
                              <Button variant="outline-primary" size="sm">詳細</Button>
                            </Link>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                  
                  <div className="text-center mt-3">
                    <Link to="/pets">
                      <Button variant="primary">ペット一覧を見る</Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {mostActivePet && (
            <Card>
              <Card.Header>
                <h4>🏆 最も活発なペット</h4>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <h5>{mostActivePet.name}</h5>
                  <p className="text-muted">
                    {mostActivePet.diary_count}件の日記を投稿
                  </p>
                  <Link to={`/pets/${mostActivePet.id}/diaries`}>
                    <Button variant="primary" size="sm">日記を見る</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>クイックアクション</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/pets/new">
                  <Button variant="primary">新しいペットを登録</Button>
                </Link>
                <Link to="/diaries/new">
                  <Button variant="primary">日記を書く</Button>
                </Link>
                <Link to="/diaries">
                  <Button variant="outline-primary">すべての日記を見る</Button>
                </Link>
                <Link to="/pets">
                  <Button variant="outline-primary">ペット一覧</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;