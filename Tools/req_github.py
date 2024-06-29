import requests
import os

# ダウンロード先ディレクトリのパス
download_dir = "C:/Users/unico/Desktop/git"

# GitHub APIのヘッダーに認証トークンを追加
headers = {
    "Authorization": ""
}

# キーワードと言語でリポジトリを検索
keyword = "Nature+Remo"
url = f"https://api.github.com/search/repositories?q={keyword}+language:{language}"

response = requests.get(url, headers=headers)
data = response.json()

# 検索結果をスター数でソート
sorted_repos = sorted(data["items"], key=lambda x: x["stargazers_count"], reverse=True)

# ソートされた順序でリポジトリをダウンロード
for item in sorted_repos:
    repo_url = item["html_url"]
    repo_name = item["name"]
    repo_path = os.path.join(download_dir, repo_name)
    os.system(f"git clone {repo_url} {repo_path}")
