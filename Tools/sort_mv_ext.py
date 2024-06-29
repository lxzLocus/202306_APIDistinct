import os
import shutil

def copy_files(src_dir, dst_dir, ext):
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(ext):
                src_file = os.path.join(root, file)
                dst_file = os.path.join(dst_dir, file)

                # ファイル名がすでに存在する場合、番号を振る
                if os.path.exists(dst_file):
                    base, extension = os.path.splitext(file)
                    count = 1
                    while True:
                        new_filename = f"{base}_{count}{extension}"
                        dst_file = os.path.join(dst_dir, new_filename)
                        if not os.path.exists(dst_file):
                            break
                        count += 1

                shutil.copy2(src_file, dst_file)

src_dir = 'C:\\Users\\unico\\Desktop\\tmp'
dst_dir = 'C:\\Users\\unico\\Desktop\\gs'

copy_files(src_dir, os.path.join(dst_dir, 'js'), '.js')
copy_files(src_dir, os.path.join(dst_dir, 'gs'), '.gs')
