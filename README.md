<samp>
<div align="center">

# AnimaLog

<img width="4596" height="2229" alt="Image" src="https://github.com/user-attachments/assets/17424da6-1ac3-47fe-95d7-4b55c991f703" />

## アプリURL情報

</div>

**◆ URL**  
[https://animalog-nabinemu.com](https://animalog-nabinemu.com)

**◆ テストユーザー情報**  
User：`test-user` <br>
Email：`test@example.com`  
Password：`Password-01`  

✅ 新規ユーザー登録も可能です。 
> [!IMPORTANT]  
> **ご利用に関する注意点** <br>
> 　**データの取り扱い**: 本アプリはポートフォリオ公開用です。登録・作成されたデータは定期的に削除いたしますので、機密情報等の入力はお控えください。  
> 　**稼働時間**: コスト最適化のため、22:00 ～ 翌7:00（JST）の間はアプリケーションを停止しております。
<br>

<div align="center">

## インフラ構成図

<img width="1151" height="941" alt="Image" src="https://github.com/user-attachments/assets/cf7f0ff7-56c6-4df5-80c9-f0a39e6d1324" />

</div>

<br>

<div align="center">

## CI/CDパイプライン図
### インフラ構築パイプライン
<img width="1201" height="468" alt="Image" src="https://github.com/user-attachments/assets/860a37a2-87ba-4cc0-88c6-42e987c9afec" />

### アプリ更新パイプライン
<img width="1112" height="468" alt="Image" src="https://github.com/user-attachments/assets/55d02f54-97d5-4171-ad7a-6ddf3363a824" />

</div>

<br>

<div align="center">

## 概要

</div>

AWS上に構築した、IaCによる再現性の確保とCI/CDパイプラインによる自動デプロイを実現したWebアプリケーション基盤ポートフォリオです。
<br>
ECSを用いたモダンなコンテナ運用に加え、実務で不可欠な **『セキュリティの担保』と『コスト最適化』の両立**に深く踏み込んで設計しました。

### ◆ アプリケーション機能

| 機能 | 概要 | 使用サービス |
| :--- | :--- | :--- |
| **ユーザー認証** | セキュアなログイン・ログアウト、サインアップ機能 | **Cognito** |
| **ペット管理** | ペットのプロフィール登録・編集・削除 | **ECS / RDS** |
| **日記投稿** | テキストと画像を組み合わせた日常の記録 | **ECS / RDS** |
| **画像保存** | 投稿された画像データの堅牢なストレージ保存 | **S3** |
| **日記一覧** | ペット別・全体での動的なフィルタリング表示 | **ECS / RDS** |

<br>

<div align="center">

## 作成の背景

</div>

インフラエンジニアとして、実務標準になりつつあるIaCやCI/CDを用いたモダンなインフラ構築フローの習得・証明を目的としたポートフォリオです。
単なるツールの導入に留まらず、個人開発のコスト制約を技術的な創意工夫で解決し、**セキュリティとコストパフォーマンスを両立させる**設計プロセスに注力しました。

<br>

<div align="center">

## こだわりポイント

</div>

### 1. 実務視点でのコスト最適化
個人開発のコスト制約下において、実務で多用される「標準的なマルチAZ構成」を基準とし、代替技術の採用によりセキュリティを維持したままランニングコストを大幅にカットしました。

| 項目 | 標準構成 (2AZ想定) | 金額 (月) | 本プロジェクトの設計 | 金額 (月) |
| :--- | :--- | :--- | :--- | :--- |
| **インバウンド通信** | ALB | 約 $17.49 〜 | CloudFront + ECS(Public IPv4) | 約 $3.60  |
| **アウトバウンド通信** | NAT Gateway | 約 $32.40 〜 | Public Subnet + SG制御 | $0 |
| **VPC内接続** | Interface Endpoint ※1 | 約 $86.40 〜 | (同上) | $0 |
| **機密情報管理** | Secrets Manager ※2 | 約 $0.80 | Parameter Store | $0 |
| **合計** | - | **約 $137.09 〜** | - | **約 $3.60** |

> [!NOTE]
> ※1 SSM, ECR(API/DKR), Logs の計4種を2つのAZで維持した場合 <br>
> ※2 機密情報を2つ管理した場合

◆ 代替案によるセキュリティ担保 <br>
　 単なるコストカットではなく、以下の設計判断により実務要件を満たす安全性を確保しています。

* **CloudFrontによる公開基盤**: <br>
  ALBの代わりにCloudFrontをフロントに配置し、エッジでのSSL終端を行うことで固定費を最適化。ACMと連携し、低コストでセキュアなHTTPS配信基盤を構築しました。
* **セキュリティグループによる通信制御（インバウンド/アウトバウンド）**: <br>
  リソースをパブリックサブネットに配置しつつ、セキュリティグループによる多層防御を徹底し、実務レベルの機密性を担保しました。
  - **ECS (Frontend)**:  CloudFrontからの通信のみ許可し、外部からの直接アクセスを遮断。
  - **ECS (Backend)**:  フロントエンドコンテナからの内部通信のみに制限し、CloudFrontを含む外部からの直接アクセスを遮断。
  - **RDS**:  バックエンドコンテナからの通信のみを許可。
* **Parameter Storeによる機密情報管理**: <br>
  AWSベストプラクティスに基づき、SecureStringを採用。KMSによる暗号化を維持したまま、標準枠での安全な機密情報管理を実現しました。

---

### 2. IaCによる保守性と再現性の最大化
インフラ環境をCloudFormationで定義。「単なる自動化」ではなく、実務の「運用のしやすさ」を追求したモジュール設計を行っています。

* **スタック分割の最適化**:  
リソースをライフサイクル（ネットワーク/アプリ/データ）ごとに分離。メンテナンス時の影響範囲を最小化し、「密結合」による予期せぬ再作成リスクを排除しました。
* **ハイブリッドな構築手法**:  
初期基盤である GitHub OIDC 設定や、IaC管理ではセキュリティリスクが生じる Parameter Store 登録は AWS CLI で安全に実行し、他リソースを完全にコード化し、100%の再現性を確保しました。
* **静的解析の導入**:  
`cfn-lint`等による品質チェックを自動化。デプロイ前に設定ミスやベストプラクティス違反を検知する仕組みを整えています。

---

### 3. エラー対応力を備えたCI/CDパイプライン
GitHub Actionsを用い、デプロイの自動化に加えて「品質管理」と「ナレッジ蓄積」の仕組みを構築しました。

* **試行錯誤の可視化（エラーへの対応）**:  
静的解析では防げない依存関係エラーなどに対し、**PRとコミット履歴に解決プロセスを詳細に記録**。エラーをナレッジ化する「自己学習型」の開発サイクルを構築し、実務に必要なトラブルシューティング能力を習得しました。
* **早期不備検知**:  
PR時に自動テストを実行し、マージ前の段階で不備を検知。mainブランチの健全性と開発スピードを両立させています。
* **疎結合なパイプライン**:  
インフラとアプリの更新ワークフローを論理的に分離。それぞれのライフサイクルに合わせた柔軟かつ迅速なデプロイを可能にしています。


<br>

<div align="center">


## 課題解決

</div>

構築の過程で直面した主要な課題と、その解決アプローチをまとめています。

### ◆ ECS Service Connect利用時の名前解決エラー
* **課題：** ECS Service Connect利用時の名前解決に起因する疎通エラー（502 Bad Gateway）が発生。
* **原因調査：** ECS Execを活用してコンテナ内部へ潜入し調査。/etc/hosts 内にIPv4/IPv6の両エントリが存在し、NginxがIPv6を優先していたことがボトルネックであると特定。
* **解決：** FargateコンテナのIPv6制限に対応するため、Nginxの proxy_pass 先をService ConnectのIPv4固定アドレスへ明示的に変更し解決。

### ◆ ECRイメージ不在による初回構築時の循環依存
* **課題：** CloudFormationによる一括構築時、ECRにイメージがないためECSサービスが起動せず、タイムアウトエラー（NotStabilized）が発生。
* **原因調査：** リポジトリとイメージが互いの存在を前提とする依存関係が、IaCによる自動構築を阻害していると特定。
* **解決：** インフラ構築フローにイメージプッシュを一時的に組み込み、構築後のデプロイを成立させて依存関係を解消。安定稼働後は、管理の簡素化と責任分離のため、プッシュ工程をデプロイ専用ワークフローへ集約。

### ◆ フロントエンドにおける環境変数のビルド時注入
* **課題：** Cognito連携時にJWT検証エラー（401 Unauthorized）が発生し、認証後のAPI通信が拒否される。
* **原因調査：** インフラ・バックエンド層を消去法で検証し、フロントエンドの環境変数欠落を疑う。ブラウザで実行されるフロントエンドは、ECS実行時の環境変数を取得できない特性が原因と特定。
* **解決：** DockerfileとGitHub Actionsを修正し、イメージビルド時に `ARG` を介して値を埋め込むデプロイフローへ変更。インフラ層とアプリ層の境界線を考慮した設計により解決。

<br>

<div align="center">

## 今後の課題

</div>

本プロジェクトのさらなる安定性向上、コスト最適化、および運用の効率化に向けて、以下の項目に取り組む予定です。

### ◆ セキュリティの強化
* **サプライチェーン攻撃対策の徹底**
    * 依存ライブラリ（Axios等）のバージョン固定（Pinning）を徹底し、ビルドの再現性と安全性を確保します。
    * 継続的な脆弱性スキャンの仕組みやベストプラクティスについて調査・導入を検討します。

### ◆ コスト最適化
* **ECSインスタンスのIPv6化**
    * AWSのIPv4アドレス課金への対策として、ECS(Fargate)をIPv6環境へ移行し、ネットワークコストの削減を図ります。
* **リソースの自動スケジュール運用**
    * 夜間などの非稼働時間帯において、ECSタスク数の自動スケーリング（0への縮小）およびRDSインスタンスの一時停止・起動を自動化し、無駄な稼働コストを最小化します。

### ◆ インフラの自動化
* **IPアドレスの自動解決フロー構築**
    * ECSタスク再起動時に変更されるパブリックIPを、Lambdaを用いてCloudFrontのオリジンへ自動的に反映・割り当てる仕組みを構築します。

### ◆ 品質向上と信頼性
* **テストコードの拡充と学習**
    * **インフラレイヤー**: 静的解析は導入済みですが、今後はさらに踏み込み、セキュリティポリシーの自動チェックや、リソースの整合性テスト手法を調査・習得します。
    * **アプリレイヤー**: フロントエンド・バックエンドにおけるユニットテストや統合テストの概念を調査し、テストコードの記述方法を習得します。
    * **CI/CD 連携**: 学習したテストを GitHub Actions のパイプラインへ統合し、コードの変更がアプリ・インフラ両面の品質を損なわないことを自動で担保する仕組みの構築を目指します。
* **オブザーバビリティ（可観測性）の概念理解と学習**
    * 「システムが今どういう状態か」を正しく把握するための概念である「オブザーバビリティ」について、基礎から調査・学習を開始します。
    * 従来の単純な死活監視だけでなく、障害発生時に「何が起きているか」を迅速に特定するための手法を学び、将来的な基盤構築を目指します。

<br>

<div align="center">

## 技術スタック

</div>

### フロントエンド
| 技術名 | 用途 |
|--------|------|
| React | UIフレームワーク |
| TypeScript | 型安全なJavaScript開発 |
| Vite | モダンビルドツール・開発サーバー |
| React Router DOM | クライアントサイドルーティング |
| Bootstrap | CSSフレームワーク |
| React Bootstrap | React用Bootstrapコンポーネント |
| Axios | HTTP通信ライブラリ |
| AWS Amplify | AWS連携・Cognito認証 |

### バックエンド
| 技術名 | 用途 |
|--------|------|
| Python | サーバーサイド言語 |
| Flask | Webフレームワーク |
| Flask-SQLAlchemy | ORM |
| Flask-CORS | クロスオリジン対応 |
| PostgreSQL | RDBMS |
| Gunicorn | WSGI HTTPサーバー |
| python-jose | JWT(ジョット)認証・暗号化 |
| boto3 | AWS SDK |

### インフラ・AWS
| 技術名 | 用途 |
|--------|------|
| Amazon ECS Fargate | コンテナオーケストレーション |
| Amazon RDS | マネージドPostgreSQL |
| Amazon S3 | 画像ファイルストレージ |
| AWS Cognito | ユーザー認証・管理 |
| AWS System Manager | 認証情報の安全管理 |
| AWS Certificate Manager | SSL証明書管理 |
| Amazon ClooudFront | コンテンツ配信ネットワーク |
| Amazon Route 53 | DNS管理 |
| Amazon CloudWatch Logs | ログ管理・監視 |
| Amazon ECR | コンテナレジストリ |

### 開発環境・ツール
| 技術名 | 用途 |
|--------|------|
| Claude Code | AI開発アシスタント |
| GitHub Codespaces | クラウド開発環境 |
| VS Code DevContainer | 一貫した開発環境 |
| Docker | コンテナ化 |
| Docker Compose | ローカルオーケストレーション |
| Nginx | リバースプロキシ |

<br>


<div align="center">

## 構築・デプロイ手順
</div>

本プロジェクトは、セキュリティと管理の柔軟性を考慮し、初期基盤のみ AWS CLI で展開します。

### 1. GitHub 連携（OIDC）の作成
* CloudFormation テンプレートを実行し、GitHub Actions 用の IAM ロールを作成。
```bash
aws cloudformation deploy \
  --template-file 00-oicd.yml \
  --stack-name my-project-admin-oidc \
  --parameter-overrides GitHubOrg={ユーザー名} RepositoryName={リポジトリ名} \
  --capabilities CAPABILITY_NAMED_IAM
```
* 作成されたロールの ARN を GitHub Secrets (AWS_IAM_ROLE_ARN) に登録。

### 2. 機密情報の登録
* セキュリティリスク低減のため、機密情報は Parameter Store に直接登録。
```bash
# データベースパスワードの登録
aws ssm put-parameter --name "/portfolio/MasterUserPassword" --value "XXXXX" --type "SecureString" --overwrite
# ACM証明書ARNの登録
aws ssm put-parameter --name "/portfolio/CertificateArn" --value "arn:aws:acm:ap-northeast-1:XXXXX:certificate/XXXXX" --type "String" --overwrite
```

### 3. 自動デプロイ
* **自動実行**: GitHub への pull_request または push (main) をトリガーに、インフラ環境デプロイの CI/CD パイプラインが全自動で実行。
* **任意実行**: GitHub 画面上のボタンから、AWS CloudFormation Deploy のワークフローを実行し、任意のタイミングで自動デプロイを実行。

</samp>