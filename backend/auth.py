from functools import wraps
from flask import request, jsonify, current_app
from jose import jwt, JWTError
from jose.exceptions import JWTClaimsError, ExpiredSignatureError
from datetime import datetime
import requests
from models import User, db

def get_current_user():
    """トークンから現在のユーザーを取得、または開発環境ではモックユーザーを使用"""
    if not current_app.config['USE_COGNITO']:
        # 開発モード - モックユーザーを使用
        mock_sub = current_app.config['MOCK_USER_ID']
        user = User.query.filter_by(cognito_sub=mock_sub).first()
        if not user:
            user = User(
                cognito_sub=mock_sub,
                email=current_app.config['MOCK_USER_EMAIL'],
                username=current_app.config['MOCK_USER_NAME']
            )
            db.session.add(user)
            db.session.commit()
        return user
    
    # 本番モード - Cognitoトークンを検証
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    user_info = verify_cognito_token(token)
    if not user_info:
        return None
    
    # ユーザーを検索または作成（エラーハンドリング追加）
    try:
        user = User.query.filter_by(cognito_sub=user_info['sub']).first()
        if not user:
            user = User(
                cognito_sub=user_info['sub'],
                email=user_info.get('email', ''),
                username=user_info.get('name', user_info.get('email', '').split('@')[0])
            )
            db.session.add(user)
            db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Database error in get_current_user: {str(e)}")
        db.session.rollback()
        return None
    
    return user

def login_required(f):
    """認証を必須とするデコレータ"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def verify_cognito_token(token):
    """Cognito JWTトークンを検証"""
    from utils.cognito_cache import get_jwks_keys, find_key_by_kid
    
    try:
        region = current_app.config['COGNITO_REGION']
        user_pool_id = current_app.config['COGNITO_USER_POOL_ID']
        
        # キャッシュされたJWKSキーを取得
        keys = get_jwks_keys(region, user_pool_id)
        
        # トークンヘッダをデコードしてkidを取得
        headers = jwt.get_unverified_headers(token)
        kid = headers['kid']
        
        # 正しいキーを検索
        try:
            key = find_key_by_kid(keys, kid)
        except Exception as e:
            current_app.logger.error(str(e))
            return None
        
        # トークンを検証してデコード
        # at_hashの検証をスキップするオプションを追加
        payload = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience=current_app.config['COGNITO_APP_CLIENT_ID'],
            options={"verify_at_hash": False}
        )
        
        # トークンの有効期限を検証
        if datetime.fromtimestamp(payload['exp']) < datetime.utcnow():
            current_app.logger.warning("Token expired")
            return None
        
        return payload
        
    except JWTClaimsError as e:
        current_app.logger.warning(f"JWT claims validation failed: {e}")
        return None
    except ExpiredSignatureError:
        current_app.logger.warning("JWT token expired")
        return None
    except JWTError as e:
        current_app.logger.error(f"JWT validation error: {e}")
        return None
    except (KeyError, requests.RequestException) as e:
        current_app.logger.error(f"Token verification error: {e}")
        return None