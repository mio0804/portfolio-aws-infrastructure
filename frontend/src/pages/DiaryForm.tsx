import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { diariesAPI, petsAPI } from '../services/api';
import type { Pet, Diary } from '../types/index.js';

const DiaryForm: React.FC = () => {
  const { petId, id } = useParams<{ petId: string; id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [pets, setPets] = useState<Pet[]>([]);
  const [formData, setFormData] = useState({
    pet_id: petId || '',
    title: '',
    content: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);

  useEffect(() => {
    fetchPets();
    if (isEditMode && id) {
      fetchDiary();
    }
  }, [id, isEditMode]);

  const fetchDiary = async () => {
    if (!id) return;
    
    setIsInitialLoading(true);
    try {
      const response = await diariesAPI.getOne(id);
      const diary: Diary = response.diary;
      
      setFormData({
        pet_id: diary.pet_id,
        title: diary.title || '',
        content: diary.content,
      });
      
      if (diary.image_url) {
        setExistingImageUrl(diary.image_url);
        setImagePreview(diary.image_url);
      }
    } catch (err) {
      setError('日記の取得に失敗しました');
      console.error('日記の取得に失敗しました:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchPets = async () => {
    try {
      const response = await petsAPI.getAll();
      setPets(response.pets);
    } catch (err) {
      setError('ペット一覧の取得に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.content) {
      setError('ペットと内容は必須です');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let imageUrl = existingImageUrl;

      // 新しい画像が選択されている場合は、署名付きURLを使ってS3に直接アップロード
      if (selectedFile) {
        try {
          // 1. 署名付きURLを取得
          const presignedResponse = await diariesAPI.getPresignedUrl(
            selectedFile.name,
            selectedFile.type
          );

          // 2. S3に直接アップロード
          const uploadResponse = await fetch(presignedResponse.upload_url, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error('画像のアップロードに失敗しました');
          }

          // 3. アップロード成功後のURLを使用
          imageUrl = presignedResponse.file_url;
        } catch (uploadError) {
          console.error('画像のアップロードに失敗しました:', uploadError);
          throw new Error('画像のアップロードに失敗しました');
        }
      }

      // 日記データの準備（画像はURLとして送信）
      const diaryData = {
        pet_id: formData.pet_id,
        content: formData.content,
        title: formData.title || undefined,
        image_url: imageUrl || undefined,
      };

      if (isEditMode && id) {
        await diariesAPI.update(id, diaryData);
        navigate(`/diaries/${id}`);
      } else {
        await diariesAPI.create(diaryData);
        if (petId) {
          navigate(`/pets/${petId}/diaries`);
        } else {
          navigate('/diaries');
        }
      }
    } catch (err) {
      setError(isEditMode ? '日記の更新に失敗しました' : '日記の投稿に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズをチェック（16MB制限）
      if (file.size > 16 * 1024 * 1024) {
        setError('ファイルサイズは16MB以下にしてください');
        return;
      }

      // ファイルタイプをチェック
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です');
        return;
      }

      setSelectedFile(file);
      
      // プレビューを作成
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setExistingImageUrl('');
    // ファイル入力をリセット
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (isInitialLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Card.Header>
          <h2>{isEditMode ? '日記を編集' : '新しい日記を書く'}</h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>ペット *</Form.Label>
              <Form.Select
                name="pet_id"
                value={formData.pet_id}
                onChange={handleChange}
                required
                disabled={Boolean(petId) || isEditMode}
              >
                <option value="">ペットを選択してください</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>タイトル</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="日記のタイトル（任意）"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>内容 *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="今日の出来事や気持ちを書いてください"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>写真</Form.Label>
              <Form.Control
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                JPEG、PNG、GIF、WebP形式（最大16MB）
              </Form.Text>
            </Form.Group>

            {imagePreview && (
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
                  className="img-thumbnail"
                />
                <div className="mt-2">
                  <Button variant="outline-danger" size="sm" onClick={removeImage}>
                    画像を削除
                  </Button>
                </div>
              </div>
            )}

            <div className="d-flex gap-2 flex-wrap">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (isEditMode ? '更新中...' : '投稿中...') : (isEditMode ? '更新' : '投稿')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => navigate(-1)}
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

export default DiaryForm;