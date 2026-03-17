"""
AWS S3クライアント初期化ユーティリティ
本番環境（ECSに付与されたIAMロール）とローカル開発環境（明示的クレデンシャル）を自動切り替え
"""
import boto3
import os


def create_s3_client(config=None):
    """
    環境に応じてS3クライアントを初期化
    
    Args:
        config: Flask app.config または Config インスタンス
        
    Returns:
        boto3.client: S3クライアント
    """
    if config is None:
        # スクリプト実行時は直接環境変数から読み取り
        aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_REGION', 'ap-northeast-1')
    else:
        # Flask アプリケーション実行時は config から読み取り
        aws_access_key_id = config.get('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = config.get('AWS_SECRET_ACCESS_KEY')
        aws_region = config.get('AWS_REGION', 'ap-northeast-1')
    
    # IAMロール使用の判定条件: AWS_ACCESS_KEY_ID が未設定または空
    use_iam = not aws_access_key_id or aws_access_key_id.strip() == ''
    
    if use_iam:
        # 本番環境: IAMロールを使用（クレデンシャル省略）
        return boto3.client('s3', region_name=aws_region)
    else:
        # 開発環境: 明示的クレデンシャルを使用
        return boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region
        )


def create_s3_client_for_flask(current_app):
    """
    Flask アプリケーション用のS3クライアント初期化
    
    Args:
        current_app: Flask の current_app
        
    Returns:
        boto3.client: S3クライアント
    """
    return create_s3_client(current_app.config)


def create_s3_client_for_script(config_obj):
    """
    スクリプト用のS3クライアント初期化
    
    Args:
        config_obj: Config クラスのインスタンス
        
    Returns:
        boto3.client: S3クライアント
    """
    config_dict = {
        'AWS_ACCESS_KEY_ID': config_obj.AWS_ACCESS_KEY_ID,
        'AWS_SECRET_ACCESS_KEY': config_obj.AWS_SECRET_ACCESS_KEY,
        'AWS_REGION': config_obj.AWS_REGION
    }
    return create_s3_client(config_dict)