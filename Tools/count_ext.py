import os

def count_files_with_extensions(path, extensions):
    count = 0
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(tuple(extensions)):
                count += 1
    return count

# パスと検索する拡張子のリストを指定
path_to_search = 'C:/Users/unico/Desktop/rep'
file_extensions_to_count = ['.gs', '.js']

# ファイル数を取得
file_count = count_files_with_extensions(path_to_search, file_extensions_to_count)

print(f'The number of .gs and .js files in {path_to_search}: {file_count}')
