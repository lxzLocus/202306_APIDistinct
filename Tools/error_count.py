import pandas as pd
import json

# CSVファイルのパス
csv_file_path = 'C:/Users/unico/Desktop/debug_res/error.csv'

# JSONファイルのパス
json_file_path = 'C:/Users/unico/Desktop/output.json'

# CSVファイルを読み込む
df = pd.read_csv(csv_file_path)

# JSONファイルをUTF-8で読み込む
with open(json_file_path, 'r', encoding='utf-8') as json_file:
    json_data = json.load(json_file)

# 誤り数を格納するリスト
error_count = []
error_paths = []

# CSVの各行を処理
for index, row in df.iterrows():
    # CSVのファイルパス
    csv_path = row['RecommendedFilePath']

    # csv_pathが欠損値でないことを確認
    if pd.notna(csv_path):
        # 対応するJSONデータを探す
        json_entry = next((entry for entry in json_data['files'] if entry['path'].lower() == csv_path.lower()), None)

        # JSONエントリが見つからないか、flagがFalseの場合
        if json_entry is None or not json_entry['flag']:
            error_count.append(1)
            error_paths.append(csv_path)
        else:
            error_count.append(0)
            error_paths.append('')
    else:
        # csv_pathが欠損値の場合は空の文字列を追加
        error_count.append(1)
        error_paths.append('')

# 誤り数とファイルパスを新しい列としてDataFrameに追加
df['ErrorCount'] = error_count
df['ErrorFilePaths'] = error_paths

# 結果を出力CSVファイルに書き込む
output_csv_file_path = 'C:/Users/unico/Desktop/result.csv'
df.to_csv(output_csv_file_path, index=False)
print(f"CSV書き込み終了: {output_csv_file_path}")
