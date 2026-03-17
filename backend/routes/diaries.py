from flask import Blueprint, jsonify, request, current_app
from auth import login_required
from models import db, Diary, Pet
from utils.s3 import generate_presigned_url, delete_file, allowed_file

diaries_bp = Blueprint('diaries', __name__)

@diaries_bp.route('/api/pets/<pet_id>/diaries', methods=['GET'])
@login_required
def get_diaries(pet_id):
    """特定のペットのすべての日記を取得"""
    # ペットの所有権を検証
    pet = Pet.query.filter_by(
        id=pet_id,
        user_id=request.current_user.id
    ).first()
    
    if not pet:
        return jsonify({'error': 'Pet not found'}), 404
    
    # ページネーションパラメータを取得
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 日記をクエリ
    diaries_query = Diary.query.filter_by(pet_id=pet_id).order_by(Diary.created_at.desc())
    pagination = diaries_query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'diaries': [diary.to_dict() for diary in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@diaries_bp.route('/api/diaries', methods=['GET'])
@login_required
def get_all_diaries():
    """現在のユーザーのペットのすべての日記を取得"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    diaries_query = Diary.query.filter_by(
        user_id=request.current_user.id
    ).order_by(Diary.created_at.desc())
    
    pagination = diaries_query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'diaries': [diary.to_dict() for diary in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@diaries_bp.route('/api/diaries/<diary_id>', methods=['GET'])
@login_required
def get_diary(diary_id):
    """特定の日記エントリを取得"""
    diary = Diary.query.filter_by(
        id=diary_id,
        user_id=request.current_user.id
    ).first()
    
    if not diary:
        return jsonify({'error': 'Diary not found'}), 404
    
    return jsonify({'diary': diary.to_dict()})

@diaries_bp.route('/api/diaries', methods=['POST'])
@login_required
def create_diary():
    """新しい日記エントリを作成"""
    # JSONデータのみ受け付ける（FormDataは受け付けない）
    data = request.get_json()
    
    # 必須フィールドを検証
    if not data.get('pet_id') or not data.get('content'):
        return jsonify({'error': 'Pet ID and content are required'}), 400
    
    # ペットの所有権を検証
    pet = Pet.query.filter_by(
        id=data['pet_id'],
        user_id=request.current_user.id
    ).first()
    
    if not pet:
        return jsonify({'error': 'Pet not found'}), 404
    
    # 画像URLの処理（署名付きURL経由でアップロード済み）
    image_url = data.get('image_url')
    
    # 日記エントリを作成
    diary = Diary(
        pet_id=pet.id,
        user_id=request.current_user.id,
        title=data.get('title'),
        content=data['content'],
        image_url=image_url
    )
    
    db.session.add(diary)
    db.session.commit()
    
    return jsonify({'diary': diary.to_dict()}), 201

@diaries_bp.route('/api/diaries/<diary_id>', methods=['PUT'])
@login_required
def update_diary(diary_id):
    """日記エントリを更新"""
    diary = Diary.query.filter_by(
        id=diary_id,
        user_id=request.current_user.id
    ).first()
    
    if not diary:
        return jsonify({'error': 'Diary not found'}), 404
    
    data = request.get_json()
    
    # 提供されたフィールドを更新
    if 'title' in data:
        diary.title = data['title']
    if 'content' in data:
        diary.content = data['content']
    
    db.session.commit()
    
    return jsonify({'diary': diary.to_dict()})

@diaries_bp.route('/api/diaries/<diary_id>', methods=['DELETE'])
@login_required
def delete_diary(diary_id):
    """日記エントリを削除"""
    diary = Diary.query.filter_by(
        id=diary_id,
        user_id=request.current_user.id
    ).first()
    
    if not diary:
        return jsonify({'error': 'Diary not found'}), 404
    
    # 関連する画像がある場合は削除
    if diary.image_url:
        delete_file(diary.image_url, user_id=request.current_user.id)
    
    db.session.delete(diary)
    db.session.commit()
    
    return jsonify({'message': 'Diary deleted successfully'})

@diaries_bp.route('/api/upload/presigned-url', methods=['POST'])
@login_required
def get_presigned_url():
    """S3アップロード用の署名付きURLを取得"""
    if not current_app.config['USE_S3']:
        return jsonify({'error': 'S3 uploads not configured'}), 400
    
    data = request.get_json()
    filename = data.get('filename')
    file_type = data.get('file_type', 'image/jpeg')
    
    if not filename:
        return jsonify({'error': 'Filename required'}), 400
    
    if not allowed_file(filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    result = generate_presigned_url(filename, file_type, user_id=request.current_user.id)
    if not result:
        return jsonify({'error': 'Failed to generate upload URL'}), 500
    
    return jsonify(result)