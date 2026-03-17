import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { petsAPI } from '../services/api';
import type { Pet } from '../types/index.js';

const PetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    birth_date: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchPet(id);
    }
  }, [id, isEdit]);

  const fetchPet = async (petId: string) => {
    try {
      const response = await petsAPI.getOne(petId);
      const pet: Pet = response.pet;
      setFormData({
        name: pet.name,
        species: pet.species || '',
        breed: pet.breed || '',
        birth_date: pet.birth_date || '',
        description: pet.description || '',
      });
    } catch (err) {
      setError('ペット情報の取得に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isEdit && id) {
        await petsAPI.update(id, formData);
      } else {
        await petsAPI.create(formData);
      }
      navigate('/pets');
    } catch (err) {
      setError(isEdit ? '更新に失敗しました' : '登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container>
      <Card>
        <Card.Header>
          <h2>{isEdit ? 'ペット情報編集' : '新しいペット登録'}</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>名前 *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>種類</Form.Label>
              <Form.Control
                type="text"
                name="species"
                value={formData.species}
                onChange={handleChange}
                placeholder="例: 犬、猫、鳥など"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>品種</Form.Label>
              <Form.Control
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="例: 柴犬、スコティッシュフォールドなど"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>誕生日</Form.Label>
              <Form.Control
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>説明</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="ペットの性格や特徴など"
              />
            </Form.Group>

            <div className="d-flex gap-2 flex-wrap">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : (isEdit ? '更新' : '登録')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => navigate('/pets')}
              >
                キャンセル
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PetForm;