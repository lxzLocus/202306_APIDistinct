import os
import json

def list_files(directory, extension, base_path):
    file_list = []
    for foldername, subfolders, filenames in os.walk(directory):
        for filename in filenames:
            if filename.endswith(extension):
                filepath = os.path.join(foldername, filename)
                if filepath.startswith(base_path):
                    file_list.append({"path": filepath, "url": False, "fetch": False})
    return file_list

def main():
    folder_path = "D:/WorkSpace/e_drive/202306/git-nature-js/#experiment"  # ここに対象のフォルダパスを指定してください
    base_path = "D:/WorkSpace/e_drive/202306/git-nature-js/#experiment"  # ここに基準となるパスを指定してください
    extension = (".gs", ".js")
    output_path = "C:/Users/unico/Desktop/tf.json"  # ここに結果を保存するファイルのパスを指定してください

    # フォルダパスから指定された拡張子のファイルリストを取得
    file_list = list_files(folder_path, extension, base_path)

    # アルファベット順にソート
    file_list.sort(key=lambda x: x["path"])

    # 結果をJSONに保存
    result = {"files": file_list}
    with open(output_path, "w") as json_file:
        json.dump(result, json_file, indent=2)

if __name__ == "__main__":
    main()
