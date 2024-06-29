import os
import json

def check_string_in_folder(json_file_path, base_folder):
    # JSONファイルを読み込む
    with open(json_file_path, 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)

    # 'files'リストから各要素を取り出し、pathとflagの値を取得
    for file_info in data.get('files', []):
        path_in_json = file_info.get('path')
        flag = file_info.get('flag', False)

        # 実際のファイルパスを生成
        full_file_path = os.path.join(base_folder, path_in_json)

        # ファイルが存在し、flagの値がTrueかつ文字列が見つからない場合、またはFlagがFalseかつ文字列が見つかった場合に出力
        if os.path.exists(full_file_path):
            try:
                with open(full_file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    string_found = 'api.nature' in content  # 'your_target_string'を実際の検索対象の文字列に置き換えてください

                    if (flag is True and not string_found) or (flag is False and string_found):
                        print(f"Flag is {flag}, but {'string found' if string_found else 'string not found'} in file: {full_file_path}")
            except Exception as e:
                print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    json_file_path = "C:/users/unico/desktop/output.json"
    base_folder = "D:/WorkSpace/e_drive/202306/git-nature-js/#experiment"
    check_string_in_folder(json_file_path, base_folder)
