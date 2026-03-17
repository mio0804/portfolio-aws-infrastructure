import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { petsAPI, diariesAPI } from '../services/api';
import type { Pet, Diary } from '../types/index.js';

const PetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [recentDiaries, setRecentDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPetAndDiaries();
    }
  }, [id]);

  const fetchPetAndDiaries = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // ペット情報を取得
      const petResponse = await petsAPI.getOne(id);
      setPet(petResponse.pet);
      
      // 最新の日記を取得（最大3件）
      try {
        const diariesResponse = await diariesAPI.getAllByPet(id, 1);
        setRecentDiaries(diariesResponse.diaries);
      } catch (err) {
        // 日記の取得に失敗してもペット詳細は表示
        console.error('Failed to fetch diaries:', err);
      }
    } catch (err) {
      setError('ペット情報の取得に失敗しました');
      console.error('Failed to fetch pet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pet || !window.confirm(`${pet.name}を削除しますか？\n関連する日記もすべて削除されます。`)) return;
    
    try {
      await petsAPI.delete(pet.id);
      navigate('/pets');
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
        <Link to="/pets">
          <Button variant="secondary">ペット一覧に戻る</Button>
        </Link>
      </Container>
    );
  }

  if (!pet) {
    return (
      <Container>
        <Alert variant="warning">ペットが見つかりませんでした</Alert>
        <Link to="/pets">
          <Button variant="secondary">ペット一覧に戻る</Button>
        </Link>
      </Container>
    );
  }

  const age = calculateAge(pet.birth_date || null);

  return (
    <Container>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-column flex-md-row gap-3">
          <h2 className="mb-0">{pet.name}のプロフィール</h2>
          <div className="d-flex gap-2 flex-wrap">
            <Link to={`/pets/${pet.id}/edit`}>
              <Button variant="primary" size="sm">編集</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              削除
            </Button>
            <Link to="/pets">
              <Button variant="secondary" size="sm">一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="pet-card mb-4">
            <Card.Header>
              <h4>基本情報</h4>
            </Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-4">名前</dt>
                <dd className="col-sm-8">{pet.name}</dd>
                
                {pet.species && (
                  <>
                    <dt className="col-sm-4">種類</dt>
                    <dd className="col-sm-8">{pet.species}</dd>
                  </>
                )}
                
                {pet.breed && (
                  <>
                    <dt className="col-sm-4">品種</dt>
                    <dd className="col-sm-8">{pet.breed}</dd>
                  </>
                )}
                
                {pet.birth_date && (
                  <>
                    <dt className="col-sm-4">誕生日</dt>
                    <dd className="col-sm-8">
                      {formatDate(pet.birth_date)}
                      {age !== null && ` (${age}歳)`}
                    </dd>
                  </>
                )}
                
                <dt className="col-sm-4">登録日</dt>
                <dd className="col-sm-8">{formatDate(pet.created_at)}</dd>
              </dl>
            </Card.Body>
          </Card>

          {pet.description && (
            <Card className="pet-card">
              <Card.Header>
                <h4>説明</h4>
              </Card.Header>
              <Card.Body>
                <p style={{ whiteSpace: 'pre-wrap' }}>{pet.description}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={6}>
          <Card className="diary-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>最近の日記</h4>
              <Link to={`/pets/${pet.id}/diaries`}>
                <Button variant="primary" size="sm">すべて見る</Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {recentDiaries.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted mb-3">まだ日記がありません</p>
                  <Link to={`/pets/${pet.id}/diaries/new`}>
                    <Button variant="primary">最初の日記を書く</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {recentDiaries.map((diary) => (
                    <Card key={diary.id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6>{diary.title || '無題の日記'}</h6>
                            <p className="text-muted small mb-1">
                              {formatDate(diary.created_at)}
                            </p>
                            <p className="mb-0">
                              {diary.content.length > 100
                                ? `${diary.content.substring(0, 100)}...`
                                : diary.content
                              }
                            </p>
                          </div>
                          {diary.image_url && (
                            <img
                              src={diary.image_url}
                              alt="Diary"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              className="rounded ms-3"
                            />
                          )}
                        </div>
                        <div className="mt-2">
                          <Link to={`/diaries/${diary.id}`}>
                            <Button variant="outline-primary" size="sm">詳細</Button>
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                  <div className="text-center mt-3">
                    <Link to={`/pets/${pet.id}/diaries/new`}>
                      <Button variant="primary">新しい日記を書く</Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PetDetail;