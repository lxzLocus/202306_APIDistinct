import json
import os

def search_entries(json_data):
    matching_entries = []

    for entry in json_data.get("files", []):
        if entry.get("url") is True and entry.get("fetch") is True and entry.get("endp") is not None:
            matching_entries.append(os.path.normpath(entry.get("path")))

    return matching_entries

# JSONファイルのパス
json_file_path = "E:\\Files\\workspace\\202306\\API_json\\tf\\true_or_false.json"

# JSONファイルを読み込む
with open(json_file_path, "r", encoding="utf-8") as json_file:
    data = json.load(json_file)

# 検索条件に一致するエントリを取得
matching_entries = search_entries(data)

# CSVファイルのパス
csv_file_path = "D:\\WorkSpace\\e_drive\\202306\\Response\\result_01071640.csv"  # あなたのCSVファイルのパスを指定してください

# CSVファイルを読み込む
# CSVファイルを読み込む
with open(csv_file_path, "r", encoding="utf-8") as csv_file:
    # CSVファイルの各行を処理
    for line in csv_file:
        # カンマで分割
        values = line.strip().split(",")

        # SelectedFileのファイルパスを取得し正規化
        selected_file_path = os.path.normpath(values[1])

        # Matching entriesに存在する場合は削除
        if selected_file_path in matching_entries:
            matching_entries.remove(selected_file_path)

# 残ったファイルパスを出力
print("SelectedFileに存在しないファイルパス:")
for remaining_path in matching_entries:
    print(remaining_path)
