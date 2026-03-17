"""
Cognito JWKS キャッシュ
公開鍵の取得を高速化するためのキャッシュシステム
"""
import requests
import logging
from utils.cache import cached_function

logger = logging.getLogger(__name__)

@cached_function('cognito_jwks', ttl_seconds=3600)  # 1時間キャッシュ
def get_jwks_keys(region: str, user_pool_id: str) -> list:
    """
    Cognito JWKSキーを取得（キャッシュ付き）
    
    Args:
        region: AWSリージョン
        user_pool_id: Cognito User Pool ID
        
    Returns:
        list: JWKS keys
    """
    keys_url = f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'
    
    try:
        response = requests.get(keys_url, timeout=30)
        
        if response.status_code != 200:
            raise Exception(f"JWKS fetch failed with status {response.status_code}")
        
        keys = response.json()['keys']
        return keys
        
    except requests.RequestException as e:
        logger.error(f"JWKS fetch failed: {str(e)}")
        raise Exception(f"Failed to fetch JWKS keys: {str(e)}")

def find_key_by_kid(keys: list, kid: str) -> dict:
    """
    指定されたkidのキーを検索
    
    Args:
        keys: JWKS keys list
        kid: Key ID
        
    Returns:
        dict: 対応するキー
        
    Raises:
        Exception: キーが見つからない場合
    """
    key = next((k for k in keys if k['kid'] == kid), None)
    if not key:
        raise Exception(f"JWT key not found for kid: {kid}")
    return key