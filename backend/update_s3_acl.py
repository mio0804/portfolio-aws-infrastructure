#!/usr/bin/env python
"""
既存のS3オブジェクトのACLをプライベートに更新（署名付きURLでセキュア化）
"""
import boto3
from config import Config
from utils.aws_client import create_s3_client_for_script

def update_s3_acl():
    config = Config()
    
    if not config.USE_S3:
        print("USE_S3 is not enabled. Please set USE_S3=true in .env file")
        return
    
    # S3クライアントを初期化
    s3_client = create_s3_client_for_script(config)
    
    # diary-imagesプレフィックス内のすべてのオブジェクトをリスト
    try:
        response = s3_client.list_objects_v2(
            Bucket=config.S3_BUCKET_NAME,
            Prefix='diary-images/'
        )
        
        if 'Contents' not in response:
            print("No images found in S3")
            return
        
        objects = response['Contents']
        print(f"Found {len(objects)} objects to update")
        
        # 各オブジェクトのACLを更新
        for obj in objects:
            key = obj['Key']
            try:
                s3_client.put_object_acl(
                    Bucket=config.S3_BUCKET_NAME,
                    Key=key,
                    ACL='private'
                )
                print(f"✓ Updated ACL for {key}")
            except Exception as e:
                print(f"✗ Failed to update ACL for {key}: {e}")
        
        print("\nACL update complete! All objects are now private and accessible via presigned URLs only.")
        
    except Exception as e:
        print(f"Error listing objects: {e}")

if __name__ == '__main__':
    update_s3_acl()