# Python 3.11の公式イメージ OSのversionを指定（開発環境用）
FROM mcr.microsoft.com/devcontainers/python:3.11-bookworm

# 作業ディレクトリを指定
WORKDIR /workspace

# 必要なパッケージをコピー
COPY requirements.txt .

# Pythonライブラリをインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリのコードをコピー（VSCodeからはマウントされるが、buildでも必要）
COPY . .

# 使用ポートの宣言（Flask用とReact用）
EXPOSE 5000
EXPOSE 3000

# Node.js（20系）と npm をインストール
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
&& apt-get install -y nodejs

# claude をインストール
RUN npm install -g @anthropic-ai/claude-code

# AWS CLI v2をインストール（本番環境でのECS Exec、S3操作に必須）
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip -o awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# vscode ユーザを作成する
RUN if ! id -u ${USERNAME} > /dev/null 2>&1; then \
    groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME; \
    fi
# workspace ディレクトリの設定
RUN mkdir -p /workspace && chown -R $USERNAME:$USERNAME /workspace

# vscode ユーザに切り替える
USER $USERNAME
