import os

def count_files_with_extensions(folder_path, extensions):
    count = 0
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(tuple(extensions)):
                count += 1
    return count

def count_files_in_projects(base_path, extensions):
    project_counts = {}

    # ベースパス内の各ディレクトリ（プロジェクトフォルダ）に対して処理を行う
    for project_folder in os.listdir(base_path):
        project_path = os.path.join(base_path, project_folder)

        # プロジェクトフォルダ内のファイル数を取得
        file_count = count_files_with_extensions(project_path, extensions)

        # プロジェクトごとのファイル数を辞書に格納
        project_counts[project_folder] = file_count

    return project_counts

# ベースパスと検索する拡張子のリストを指定
base_path_to_search = 'C:/Users/unico/Desktop/rep'
file_extensions_to_count = ['.gs', '.js']

# 各プロジェクトごとのファイル数を取得
project_file_counts = count_files_in_projects(base_path_to_search, file_extensions_to_count)

# 結果を表示
for project, count in project_file_counts.items():
    print(f'Project: {project}, File Count: {count}')
