import os

def count_folders(path):
    try:
        # 指定したパス内のフォルダ一覧を取得
        folders = [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))]

        # フォルダの数を返す
        return len(folders)
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return -1

# カウントしたいフォルダのパスを指定
target_path = "C:/Users/unico/Desktop/rep"

# フォルダの数をカウント
folder_count = count_folders(target_path)

if folder_count >= 0:
    print(f"指定されたパス内のフォルダ数: {folder_count}")
else:
    print("フォルダ数のカウントに失敗しました。")
