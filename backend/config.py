import os
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

def get_database_url():
    """環境に応じたデータベースURLを構築"""
    # RDS使用フラグの確認
    use_rds = os.getenv('USE_RDS', 'false').lower() == 'true'
    
    if use_rds:
        # 本番環境: RDS + Systems Manager
        try:
            from utils.ssm_parameter import get_rds_password
            
            # 必要な環境変数を取得
            secret_name = os.getenv('AWS_SSM_PARAMETER_NAME')
            rds_endpoint = os.getenv('RDS_ENDPOINT')
            rds_database = os.getenv('RDS_DATABASE', 'animalog')
            rds_username = os.getenv('RDS_USERNAME', 'animalog')
            aws_region = os.getenv('AWS_REGION', 'ap-northeast-1')
            
            if not secret_name:
                raise ValueError("AWS_SSM_PARAMETER_NAME is required when USE_RDS=true")
            if not rds_endpoint:
                raise ValueError("RDS_ENDPOINT is required when USE_RDS=true")
            
            # Systems Managerからパスワードを取得
            password = get_rds_password(secret_name, aws_region)
            
            # DATABASE_URLを構築（SSL設定を追加）
            return f"postgresql://{rds_username}:{password}@{rds_endpoint}:5432/{rds_database}?sslmode=require"
            
        except Exception as e:
            print(f"RDSパスワードの取得エラー: {str(e)}")
            # フォールバック: 環境変数から直接取得
            fallback_url = os.getenv('DATABASE_URL')
            if fallback_url:
                return fallback_url
            raise
    else:
        # 開発環境: ローカルPostgreSQL
        return os.getenv('DATABASE_URL', 'postgresql://animalog:animalog@db:5432/animalog')

def validate_config():
    """重要な環境変数が設定されているかチェック"""
    required_vars = ['FLASK_APP']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    # RDS使用時の追加チェック
    use_rds = os.getenv('USE_RDS', 'false').lower() == 'true'
    if use_rds:
        rds_vars = ['AWS_SSM_PARAMETER_NAME', 'RDS_ENDPOINT']
        missing_rds = [var for var in rds_vars if not os.getenv(var)]
        if missing_rds:
            missing_vars.extend(missing_rds)
    else:
        # 開発環境ではDATABASE_URLが必要
        if not os.getenv('DATABASE_URL'):
            missing_vars.append('DATABASE_URL')
    
    if missing_vars:
        raise ValueError(f"必要な環境変数が不足しています: {', '.join(missing_vars)}")
    
    # USE_COGNITOがtrueの場合、Cognito関連の変数をチェック
    if os.getenv('USE_COGNITO', 'false').lower() == 'true':
        cognito_vars = ['COGNITO_USER_POOL_ID', 'COGNITO_APP_CLIENT_ID', 'COGNITO_DOMAIN']
        missing_cognito = [var for var in cognito_vars if not os.getenv(var)]
        if missing_cognito:
            raise ValueError(f"Cognitoモードではこれらの変数が必要です: {', '.join(missing_cognito)}")
    
    # USE_S3がtrueの場合、S3関連の変数をチェック
    if os.getenv('USE_S3', 'false').lower() == 'true':
        s3_vars = ['AWS_REGION', 'S3_BUCKET_NAME']
        missing_s3 = [var for var in s3_vars if not os.getenv(var)]
        if missing_s3:
            raise ValueError(f"S3モードではこれらの変数が必要です: {', '.join(missing_s3)}")
        
        # AWS認証情報の確認（IAMロール使用時は不要）
        if not os.getenv('AWS_ACCESS_KEY_ID') and not os.getenv('AWS_SECRET_ACCESS_KEY'):
            print("警告: AWS認証情報が設定されていません。S3アクセス用のIAMロールが設定されていることを確認してください。")

class Config:
    # Flask設定
    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
    
    # データベース設定
    SQLALCHEMY_DATABASE_URI = get_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv('SQLALCHEMY_ECHO', 'false').lower() == 'true'
    
    # データベース接続プール設定
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,  # 接続の事前チェック
        'pool_recycle': 3600,   # 1時間で接続を再作成
        'pool_timeout': 30,     # 接続取得のタイムアウト
        'max_overflow': 10,     # 最大オーバーフロー接続数
        'pool_size': 5          # 基本接続プールサイズ
    }
    
    # AWS S3
    USE_S3 = os.getenv('USE_S3', 'false').lower() == 'true'
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION', 'ap-northeast-1')
    S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
    
    # Cognito設定（SPAパブリッククライアント用）
    USE_COGNITO = os.getenv('USE_COGNITO', 'false').lower() == 'true'
    COGNITO_REGION = os.getenv('COGNITO_REGION', 'ap-northeast-1')
    COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
    COGNITO_APP_CLIENT_ID = os.getenv('COGNITO_APP_CLIENT_ID')
    COGNITO_DOMAIN = os.getenv('COGNITO_DOMAIN')
    COGNITO_REDIRECT_URI = os.getenv('COGNITO_REDIRECT_URI', 'http://localhost:3000/callback')
    COGNITO_LOGOUT_URI = os.getenv('COGNITO_LOGOUT_URI', 'http://localhost:3000/login')
    
    # ファイルアップロード設定
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/workspace/uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # 開発用モックユーザー設定
    MOCK_USER_ID = os.getenv('MOCK_USER_ID', 'test-user-123')
    MOCK_USER_EMAIL = os.getenv('MOCK_USER_EMAIL', 'test@example.com')
    MOCK_USER_NAME = os.getenv('MOCK_USER_NAME', 'テスト')
    
    # CORS
    # 環境変数から取得（カンマ区切り）、デフォルトは開発環境用
    cors_origins_str = os.getenv('CORS_ORIGINS', 
        'http://localhost:3000,http://localhost:5000,https://refactored-guide-975pv96xg954cx666-3000.app.github.dev')
    CORS_ORIGINS = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]