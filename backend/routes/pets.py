from flask import Blueprint, jsonify, request
from auth import login_required
from models import db, Pet
from datetime import datetime

pets_bp = Blueprint('pets', __name__)

@pets_bp.route('/api/pets', methods=['GET'])
@login_required
def get_pets():
    """現在のユーザーのすべてのペットを取得"""
    pets = request.current_user.pets.order_by(Pet.created_at.desc()).all()
    return jsonify({'pets': [pet.to_dict() for pet in pets]})

@pets_bp.route('/api/pets/<pet_id>', methods=['GET'])
@login_required
def get_pet(pet_id):
    """特定のペットを取得"""
    pet = Pet.query.filter_by(
        id=pet_id,
        user_id=request.current_user.id
    ).first()
    
    if not pet:
        return jsonify({'error': 'Pet not found'}), 404
    
    return jsonify({'pet': pet.to_dict()})

@pets_bp.route('/api/pets', methods=['POST'])
@login_required
def create_pet():
    """新しいペットを作成"""
    data = request.get_json()
    
    # 必須フィールドを検証
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    # 生年月日が提供されている場合は解析
    birth_date = None
    if data.get('birth_date'):
        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid birth date format'}), 400
    
    # 新しいペットを作成
    pet = Pet(
        user_id=request.current_user.id,
        name=data['name'],
        species=data.get('species'),
        breed=data.get('breed'),
        birth_date=birth_date,
        description=data.get('description')
    )
    
    db.session.add(pet)
    db.session.commit()
    
    return jsonify({'pet': pet.to_dict()}), 201

@pets_bp.route('/api/pets/<pet_id>', methods=['PUT'])
@login_required
def update_pet(pet_id):
    """ペットを更新"""
    pet = Pet.query.filter_by(
        id=pet_id,
        user_id=request.current_user.id
    ).first()
    
    if not pet:
        return jsonify({'error': 'Pet not found'}), 404
    
    data = request.get_json()
    
    # 提供されたフィールドを更新
    if 'name' in data:
        pet.name = data['name']
    if 'species' in data:
        pet.species = data['species']
    if 'breed' in data:
        pet.breed = data['breed']
    if 'description' in data:
        pet.description = data['description']
    if 'birth_date' in data:
        if data['birth_date']:
            try:
                pet.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid birth date format'}), 400
        else:
            pet.birth_date = None
    
    db.session.commit()
    
    return jsonify({'pet': pet.to_dict()})

@pets_bp.route('/api/pets/<pet_id>', methods=['DELETE'])
@login_required
def delete_pet(pet_id):
    """ペットを削除"""
    pet = Pet.query.filter_by(
        id=pet_id,
        user_id=request.current_user.id
    ).first()
    
    if not pet:
        return jsonify({'error': 'Pet not found'}), 404
    
    # ペットを削除（日記はカスケード削除）
    db.session.delete(pet)
    db.session.commit()
    
    return jsonify({'message': 'Pet deleted successfully'})