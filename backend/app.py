from flask import Flask, send_from_directory, current_app
from flask_cors import CORS
from config import Config, validate_config
from models import db
from routes.auth import auth_bp
from routes.pets import pets_bp
from routes.diaries import diaries_bp
import os
import logging

def create_app():
    # 環境変数のバリデーション
    validate_config()
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # ログ設定
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # 拡張機能を初期化
    db.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    # データベース接続テスト
    try:
        with app.app_context():
            result = db.session.execute(db.text('SELECT 1'))
            logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
    
    
    # ブループリントを登録
    app.register_blueprint(auth_bp)
    app.register_blueprint(pets_bp)
    app.register_blueprint(diaries_bp)
    
    # 開発環境でのアップロードファイルの配信
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        if app.config['USE_S3']:
            # USE_S3がtrueの場合、S3 URLにリダイレクト
            s3_url = f"https://{app.config['S3_BUCKET_NAME']}.s3.{app.config['AWS_REGION']}.amazonaws.com/diary-images/{filename}"
            from flask import redirect
            return redirect(s3_url)
        else:
            # USE_S3がfalseの場合、ローカルフォルダから配信
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # ヘルスチェックエンドポイント
    @app.route('/api/health')
    def health_check():
        return {'status': 'very healthy'}
    
    # テーブルが存在しない場合は作成
    with app.app_context():
        db.create_all()
    
    return app

# Gunicorn用のアプリケーションインスタンス
app = create_app()

if __name__ == '__main__':
    app = create_app()
    import os
    port = int(os.environ.get('PORT', 5000))
    # デバッグモードは環境変数から取得
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

# ECR への自動プッシュを試行