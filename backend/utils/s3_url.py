"""
画像アクセス用の署名付きURL生成のためのS3 URLユーティリティ
"""
import boto3
from flask import current_app
from datetime import datetime, timedelta
from .aws_client import create_s3_client_for_flask

def get_presigned_url(image_url):
    """S3オブジェクトアクセス用の署名付きURLを生成"""
    if not image_url or not current_app.config['USE_S3']:
        return image_url
    
    bucket_name = current_app.config['S3_BUCKET_NAME']
    s3_prefix = f"https://{bucket_name}.s3.{current_app.config['AWS_REGION']}.amazonaws.com/"
    
    # ローカルパスの場合はS3キーに変換
    if image_url.startswith('/uploads/'):
        filename = image_url.replace('/uploads/', '')
        key = f"diary-images/{filename}"
    elif image_url.startswith(s3_prefix):
        # S3 URLの場合はキーを抽出
        key = image_url.replace(s3_prefix, '')
    else:
        # その他の形式はそのまま返す
        return image_url
    
    # プリサインドURLを生成
    s3_client = create_s3_client_for_flask(current_app)
    
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': key
            },
            ExpiresIn=3600  # 1 hour
        )
        return presigned_url
    except Exception as e:
        current_app.logger.error(f"Failed to generate presigned URL: {e}")
        return image_url