import os

def search_string_in_folder():
    # ハードコーディングでフォルダパスと検索対象の文字列を指定
    folder_path = "D:/WorkSpace/e_drive/202306/git-nature-js/#experiment"
    target_string = "Fetch"

    # フォルダが存在するか確認
    if not os.path.exists(folder_path):
        print("指定されたフォルダは存在しません。")
        return

    # 一致したファイルのセット
    matching_files_set = set()

    # フォルダ内のファイル・サブフォルダを再帰的に探索
    for root, dirs, files in os.walk(folder_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)

            # テキストファイル以外はスキップ
            if not file_path.endswith(('.gs', '.js')):  # 任意のテキストファイルの拡張子を指定
                continue

            # ファイル内の文字列を検索
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if target_string in content:
                        matching_files_set.add(file_path)
                        #print("文字列が見つかりました！")
                        print("ファイルパス:", file_path)
            except Exception as e:
                print(f"エラーが発生しました: {e}")

    # 一致したファイルの総数を表示
    print(f"一致したファイルの数: {len(matching_files_set)}")

if __name__ == "__main__":
    search_string_in_folder()
