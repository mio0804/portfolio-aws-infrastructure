"""
AWS Systems Manager (SSM) パラメータストア クライアント
RDSパスワードなどのパラメータ情報を取得する
"""
import boto3
from botocore.exceptions import ClientError
from utils.cache import cached_function

@cached_function('ssm_parameter', ttl_seconds=600)  # 10分キャッシュ
def get_parameter(parameter_name, with_decryption=True, region_name='ap-northeast-1'):
    """
    AWS SSM パラメータストアからパラメータを取得
    
    Args:
        parameter_name: パラメータ名
        with_decryption: 暗号化を復号するかどうか（SecureStringの場合はTrue）
        region_name: AWSリージョン
        
    Returns:
        str: パラメータの値
    """
    # SSMクライアントを作成
    client = boto3.client('ssm', region_name=region_name)

    try:
        response = client.get_parameter(
            Name=parameter_name,
            WithDecryption=with_decryption
        )
        return response['Parameter']['Value']
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'ParameterNotFound':
            raise Exception(f"The requested parameter {parameter_name} was not found")
        else:
            raise Exception(f"Failed to retrieve parameter: {e}")

def get_rds_password(parameter_name, region_name='ap-northeast-1'):
    """
    RDSパスワードを取得する簡易メソッド
    
    Args:
        parameter_name: パラメータ名
        region_name: AWSリージョン
        
    Returns:
        str: パスワード（文字列）
    """
    try:
        # パラメータストア（SecureString）からパスワードを取得
        password = get_parameter(parameter_name, with_decryption=True, region_name=region_name)
        return password
    except Exception as e:
        raise Exception(f"Failed to retrieve RDS password from SSM: {str(e)}")