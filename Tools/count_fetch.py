import os

def count_Fetch(folder_path):
    # カウンターの初期化
    total_count = 0

    # 指定されたフォルダ内のファイルを検索
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(('.js', '.gs')):
                file_path = os.path.join(root, file)

                # ファイル内の文字列を検索
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().lower()  # ファイル内容を小文字に変換

                    # 'Url.FetchApp'が少なくとも1回含まれている場合にカウント
                    if 'fetch' in content and '// fetch' not in content:
                        # print(f"File: {file_path} contains 'Url.FetchApp'\n")
                        total_count += 1

    # 結果を表示
    print(f"Total Files with 'fetch': {total_count}")


def count_UrlFetchApp(folder_path):
    # カウンターの初期化
    total_count = 0

    # 指定されたフォルダ内のファイルを検索
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(('.js', '.gs')):
                file_path = os.path.join(root, file)

                # ファイル内の文字列を検索
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # 'Url.FetchApp'が少なくとも1回含まれている場合にカウント
                    if 'UrlFetchApp.fetch' in content and '// UrlFetchApp.fetch' not in content:
                        # print(f"File: {file_path} contains 'Url.FetchApp'\n")
                        total_count += 1

    # 結果を表示
    print(f"Total Files with 'UrlFetchApp.fetch': {total_count}")

def count_url(folder_path):
    # カウンターの初期化
    total_count = 0

    # 指定されたフォルダ内のファイルを検索
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(('.js', '.gs')):
                file_path = os.path.join(root, file)

                # ファイル内の文字列を検索
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # 'Url.FetchApp'が少なくとも1回含まれている場合にカウント
                    if 'https://api.nature.global' in content and '// https://api.nature.global' not in content:
                        # print(f"File: {file_path} contains 'Url.FetchApp'\n")
                        total_count += 1

    # 結果を表示
    print(f"Total Files with 'Url Endpoint': {total_count}")


# テスト用のフォルダパスを指定
exercises_path = 'D:/WorkSpace/e_drive/202306/git-nature-js/#sort_extension'
gas_path = 'D:/WorkSpace/e_drive/202306/git-nature-js/#Google App Scripts'
git_path = 'C:/Users/unico/Desktop/rep'

# 関数を呼び出してカウントを実行
count_Fetch(git_path)
count_UrlFetchApp(git_path)
count_url(git_path)
