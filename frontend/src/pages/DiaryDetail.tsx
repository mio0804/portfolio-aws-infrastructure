import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diariesAPI } from '../services/api';
import type { Diary } from '../types/index.js';

const DiaryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchDiary();
    }
  }, [id]);

  const fetchDiary = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await diariesAPI.getOne(id);
      setDiary(response.diary);
    } catch (err) {
      setError('日記の取得に失敗しました');
      console.error('Failed to fetch diary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!diary || !window.confirm('この日記を削除しますか？')) return;
    
    try {
      await diariesAPI.delete(diary.id);
      navigate('/diaries');
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <Link to="/diaries">
          <Button variant="secondary">日記一覧に戻る</Button>
        </Link>
      </Container>
    );
  }

  if (!diary) {
    return (
      <Container>
        <Alert variant="warning">日記が見つかりませんでした</Alert>
        <Link to="/diaries">
          <Button variant="secondary">日記一覧に戻る</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-column flex-md-row gap-3">
          <h2 className="mb-0">{diary.title || '無題の日記'}</h2>
          <div className="d-flex gap-2 flex-wrap">
            <Link to={`/diaries/${diary.id}/edit`}>
              <Button variant="primary" size="sm">編集</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              削除
            </Button>
            <Link to="/diaries">
              <Button variant="secondary" size="sm">一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </div>

      <Card>
        {diary.image_url && (
          <Card.Img
            variant="top"
            src={diary.image_url}
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
        )}
        <Card.Body>
          <Card.Subtitle className="mb-3 text-muted">
            {diary.pet_name} | {formatDate(diary.created_at)}
          </Card.Subtitle>
          <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
            {diary.content}
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DiaryDetail;