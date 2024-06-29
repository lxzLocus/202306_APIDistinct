import os
import shutil

def copy_js_gs_files(source_dir, destination_dir):
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if file.endswith(('.js', '.gs')):
                source_path = os.path.join(root, file)
                destination_path = os.path.join(destination_dir, file)

                # 同じ名前のファイルが存在する場合は、適切な番号を追加
                count = 1
                while os.path.exists(destination_path):
                    base, extension = os.path.splitext(file)
                    destination_path = os.path.join(destination_dir, f"{base}_{count}{extension}")
                    count += 1

                # ファイルをコピー
                shutil.copy(source_path, destination_path)
                print(f"Copied: {source_path} to {destination_path}")

# ハードコーティングされたディレクトリパス
source_directory = "C:/Users/unico/Desktop/rep"
destination_directory = "C:/Users/unico/Desktop/js"

# プログラムの実行
copy_js_gs_files(source_directory, destination_directory)
