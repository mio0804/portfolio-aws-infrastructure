import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Pagination } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { diariesAPI, petsAPI } from '../services/api';
import type { Diary, Pet, PaginatedResponse } from '../types/index.js';

const DiaryList: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [pet, setPet] = useState<Pet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDiaries(1);
    if (petId) {
      fetchPet();
    }
  }, [petId]);

  const fetchPet = async () => {
    if (!petId) return;
    try {
      const response = await petsAPI.getOne(petId);
      setPet(response.pet);
    } catch (err) {
      console.error('Failed to fetch pet:', err);
    }
  };

  const fetchDiaries = async (page: number) => {
    setIsLoading(true);
    try {
      let response: PaginatedResponse<Diary>;
      if (petId) {
        response = await diariesAPI.getAllByPet(petId, page);
      } else {
        response = await diariesAPI.getAll(page);
      }
      setDiaries(response.diaries || []);
      setTotalPages(response.pages);
      setCurrentPage(page);
    } catch (err) {
      setError('日記の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('この日記を削除しますか？')) return;
    
    try {
      await diariesAPI.delete(id);
      fetchDiaries(currentPage);
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-column flex-md-row gap-3">
          <h2 className="mb-0">
            {pet ? `${pet.name}の日記` : '全ての日記'}
          </h2>
          <div className="d-flex gap-2 flex-wrap">
            {petId && (
              <Link to={`/pets/${petId}/diaries/new`}>
                <Button variant="primary" size="sm">新しい日記を書く</Button>
              </Link>
            )}
            {!petId && (
              <Link to="/pets">
                <Button variant="outline-primary" size="sm">ペット一覧に戻る</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {diaries.length === 0 ? (
        <Alert variant="info">
          まだ日記が投稿されていません。
        </Alert>
      ) : (
        <>
          <Row>
            {diaries.map((diary) => (
              <Col key={diary.id} md={6} lg={4} className="mb-4">
                <Card className="diary-card">
                  {diary.image_url && (
                    <Card.Img
                      variant="top"
                      src={diary.image_url}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    {diary.title && <Card.Title>{diary.title}</Card.Title>}
                    {!petId && diary.pet_name && (
                      <Card.Subtitle className="mb-2 text-muted">
                        {diary.pet_name}
                      </Card.Subtitle>
                    )}
                    <Card.Text>
                      {diary.content.length > 100
                        ? `${diary.content.substring(0, 100)}...`
                        : diary.content
                      }
                    </Card.Text>
                    <Card.Text>
                      <small className="text-muted">
                        {formatDate(diary.created_at)}
                      </small>
                    </Card.Text>
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      <Link to={`/diaries/${diary.id}`}>
                        <Button variant="primary" size="sm">詳細</Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(diary.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => fetchDiaries(currentPage - 1)}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => fetchDiaries(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => fetchDiaries(currentPage + 1)}
              />
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default DiaryList;