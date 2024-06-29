import os

def project_contains_string(project_path, target_string):
    # 指定されたフォルダ内のファイルを検索
    for root, dirs, files in os.walk(project_path):
        for file in files:
            if file.endswith(('.js', '.gs')):
                file_path = os.path.join(root, file)

                # ファイル内の文字列を検索
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # 特定の文字列が含まれているかどうかを判定
                    if target_string in content and f'// {target_string}' not in content:
                        return True

    # プロジェクト内で条件を満たすファイルが見つからなかった場合
    return False

def find_projects_with_string(base_path, target_string):
    projects_with_string = []

    # ベースパス内の各ディレクトリ（プロジェクトフォルダ）に対して処理を行う
    for project_folder in os.listdir(base_path):
        project_path = os.path.join(base_path, project_folder)

        # プロジェクト内で特定の文字列が含まれているかどうかを判定
        if project_contains_string(project_path, target_string):
            projects_with_string.append(project_folder)

    return projects_with_string

# ベースパスと検索する文字列を指定
base_path_to_search = 'C:/Users/unico/Desktop/rep'
target_string_to_search = 'UrlFetchApp'

# 特定の文字列が含まれるプロジェクトを取得
projects_with_string = find_projects_with_string(base_path_to_search, target_string_to_search)

# 結果を表示（各プロジェクトごとに新しい行で表示）
if projects_with_string:
    print("Projects containing '{}':".format(target_string_to_search))
    for project in projects_with_string:
        print(project)
else:
    print("No projects contain '{}'.".format(target_string_to_search))
