import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { petsAPI } from '../services/api';
import type { Pet } from '../types/index.js';

const PetList: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await petsAPI.getAll();
      setPets(response.pets);
    } catch (err) {
      setError('ペットの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('このペットを削除しますか？')) return;
    
    try {
      await petsAPI.delete(id);
      setPets(pets.filter(pet => pet.id !== id));
    } catch (err) {
      setError('削除に失敗しました');
    }
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
          <h2 className="mb-0">ペット一覧</h2>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/pets/new">
              <Button variant="primary" size="sm">新しいペットを登録</Button>
            </Link>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {pets.length === 0 ? (
        <Alert variant="info">
          まだペットが登録されていません。新しいペットを登録してください。
        </Alert>
      ) : (
        <Row>
          {pets.map((pet) => (
            <Col key={pet.id} md={6} lg={4} className="mb-4">
              <Card className="pet-card h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{pet.name}</Card.Title>
                  <div className="flex-grow-1">
                    {pet.species && <div>種類: {pet.species}</div>}
                    {pet.breed && <div>品種: {pet.breed}</div>}
                    {pet.birth_date && <div>誕生日: {pet.birth_date}</div>}
                    {pet.diary_count !== undefined && (
                      <div className="mt-2">
                        <small className="text-muted">日記: {pet.diary_count}件</small>
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2 flex-wrap mt-3">
                    <Link to={`/pets/${pet.id}`}>
                      <Button variant="primary" size="sm">詳細</Button>
                    </Link>
                    <Link to={`/pets/${pet.id}/diaries`}>
                      <Button variant="primary" size="sm">日記を見る</Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(pet.id)}
                    >
                      削除
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PetList;