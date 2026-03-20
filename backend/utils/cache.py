"""
簡易キャッシュシステム
Systems ManagerとCognito JWKSのレスポンスをキャッシュして高速化
"""
import time
import threading
from typing import Optional, Any, Dict, Callable

class SimpleCache:
    """シンプルなインメモリキャッシュ"""
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
    
    def get(self, key: str, ttl_seconds: int = 300) -> Optional[Any]:
        """キャッシュから値を取得"""
        with self._lock:
            if key not in self._cache:
                return None
            
            entry = self._cache[key]
            if time.time() - entry['timestamp'] > ttl_seconds:
                # TTL期限切れ
                del self._cache[key]
                return None
            
            return entry['value']
    
    def set(self, key: str, value: Any) -> None:
        """キャッシュに値を設定"""
        with self._lock:
            self._cache[key] = {
                'value': value,
                'timestamp': time.time()
            }
    
    def clear(self) -> None:
        """キャッシュをクリア"""
        with self._lock:
            self._cache.clear()

# グローバルキャッシュインスタンス
_global_cache = SimpleCache()

def cached_function(cache_key: str, ttl_seconds: int = 300):
    """関数の戻り値をキャッシュするデコレータ"""
    def decorator(func: Callable):
        def wrapper(*args, **kwargs):
            # キャッシュキーを引数から生成
            full_key = f"{cache_key}:{str(args)}:{str(kwargs)}"
            
            # キャッシュから取得を試行
            cached_value = _global_cache.get(full_key, ttl_seconds)
            if cached_value is not None:
                return cached_value
            
            # キャッシュにない場合は関数を実行
            result = func(*args, **kwargs)
            
            # 結果をキャッシュに保存
            _global_cache.set(full_key, result)
            
            return result
        return wrapper
    return decorator

def get_cache_stats() -> Dict[str, Any]:
    """キャッシュの統計情報を取得"""
    with _global_cache._lock:
        return {
            'cache_size': len(_global_cache._cache),
            'entries': list(_global_cache._cache.keys())
        }

def clear_cache() -> None:
    """キャッシュをクリア"""
    _global_cache.clear()