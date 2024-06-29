import os
import shutil

def copy_files_with_request_keyword(source_dir, target_dir):
    try:
        for root, _, files in os.walk(source_dir):
            for file in files:
                if file.endswith('.js'):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'request' in content:
                            target_file_path = os.path.join(target_dir, file)
                            shutil.copyfile(file_path, target_file_path)
                            print(f'Copied {file} to {target_dir}')
                        else:
                            print(f'Can not Found "request" in {file}')
    except Exception as e:
        print('An error occurred:', e)

source_directory = r'D:\WorkSpace\e_drive\202306\git-nature-js\#sort_extension\js'  # 元のフォルダのパスを指定してください
target_directory = r'D:\WorkSpace\e_drive\202306\git-nature-js\#sort_extension\js_str_request'  # コピー先のフォルダのパスを指定してください

if not os.path.exists(target_directory):
    os.makedirs(target_directory)

copy_files_with_request_keyword(source_directory, target_directory)
