import json

def search_entries(json_data):
    matching_entries = []

    for entry in json_data.get("files", []):
        if entry.get("url") is True and entry.get("fetch") is True and entry.get("endp") is not None:
            matching_entries.append(entry.get("path"))

    return matching_entries

# JSONファイルのパス
json_file_path = "E:\\Files\\workspace\\202306\\API_json\\tf\\true_or_false.json"

# JSONファイルを読み込む
with open(json_file_path, "r", encoding="utf-8") as json_file:
    data = json.load(json_file)

# 検索条件に一致するエントリを取得
result = search_entries(data)

# 結果を出力
print("Matching entries:")
for i, entry in enumerate(result, start=1):
    print(f"{i}. {entry}")

# エントリの数も表示
print(f"Total matching entries: {len(result)}")
