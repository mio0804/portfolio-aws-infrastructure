#!/usr/bin/env python3
"""
設定確認スクリプト
現在の環境変数設定を表示し、設定ミスを発見しやすくする
"""

import os
from dotenv import load_dotenv
from config import validate_config

def main():
    print("=" * 50)
    print("環境変数設定確認")
    print("=" * 50)
    
    # .envファイルを読み込み
    load_dotenv()
    
    try:
        # 設定の検証
        validate_config()
        print("✅ 環境変数の検証: OK")
    except ValueError as e:
        print(f"❌ 環境変数の検証: エラー - {e}")
        return 1
    
    print("\n📋 現在の設定:")
    print("-" * 30)
    
    # 基本設定
    print(f"FLASK_APP: {os.getenv('FLASK_APP')}")
    print(f"FLASK_ENV: {os.getenv('FLASK_ENV')}")
    print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
    
    # 認証設定
    print(f"\nUSE_COGNITO: {os.getenv('USE_COGNITO')}")
    if os.getenv('USE_COGNITO', 'false').lower() == 'true':
        print("  Cognito設定:")
        print(f"    COGNITO_USER_POOL_ID: {'設定済み' if os.getenv('COGNITO_USER_POOL_ID') else '未設定'}")
        print(f"    COGNITO_APP_CLIENT_ID: {'設定済み' if os.getenv('COGNITO_APP_CLIENT_ID') else '未設定'}")
        print(f"    COGNITO_DOMAIN: {os.getenv('COGNITO_DOMAIN') or '未設定'}")
    else:
        print("  モック認証設定:")
        print(f"    MOCK_USER_ID: {os.getenv('MOCK_USER_ID')}")
        print(f"    MOCK_USER_EMAIL: {os.getenv('MOCK_USER_EMAIL')}")
        print(f"    MOCK_USER_NAME: {os.getenv('MOCK_USER_NAME')}")
    
    # AWS設定
    print(f"\nUSE_S3: {os.getenv('USE_S3')}")
    if os.getenv('USE_S3', 'false').lower() == 'true':
        print("  S3設定:")
        print(f"    AWS_REGION: {os.getenv('AWS_REGION')}")
        print(f"    S3_BUCKET_NAME: {os.getenv('S3_BUCKET_NAME') or '未設定'}")
        print(f"    AWS_ACCESS_KEY_ID: {'設定済み' if os.getenv('AWS_ACCESS_KEY_ID') else '未設定'}")
        print(f"    AWS_SECRET_ACCESS_KEY: {'設定済み' if os.getenv('AWS_SECRET_ACCESS_KEY') else '未設定'}")
    else:
        print(f"  ローカルアップロード: {os.getenv('UPLOAD_FOLDER')}")
    
    print("\n" + "=" * 50)
    print("設定確認完了")
    return 0

if __name__ == '__main__':
    exit(main())