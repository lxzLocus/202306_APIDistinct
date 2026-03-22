import requests
import os

# ダウンロード先ディレクトリのパス
download_dir = "C:/Users/unico/Desktop/git/univ"

# GitHub APIのヘッダーに認証トークンを追加（環境変数を利用）
token = os.getenv("GITHUB_TOKEN")
headers = {"Authorization": f"Bearer {token}"} if token else {}

# プライベートリポジトリ一覧を取得
org_name = "RUEXP1EMB2023A1"
url = f"https://api.github.com/orgs/{org_name}/repositories"

response = requests.get(url, headers=headers)
data = response.json()

# リポジトリをダウンロード
for item in data:
    repo_url = item["clone_url"]
    repo_name = item["name"]
    repo_path = os.path.join(download_dir, repo_name)
    os.system(f"git clone {repo_url} {repo_path}")
