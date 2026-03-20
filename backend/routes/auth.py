from flask import Blueprint, jsonify
from auth import get_current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/me', methods=['GET'])
def get_me():
    """現在のユーザー情報を取得"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        return jsonify({'user': user.to_dict()})
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Error in /api/auth/me: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500