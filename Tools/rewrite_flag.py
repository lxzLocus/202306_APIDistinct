import json

def update_flag_from_file1_to_file2(file1_data, file2_data):
    for entry1, entry2 in zip(file1_data.get("files", []), file2_data.get("files", [])):
        if entry1.get("flag", False):
            entry2["url"] = True

def main():
    # ファイル1の読み込み
    with open("C:/Users/unico/Desktop/output.json", "r", encoding="utf-8") as file1:
        data1 = json.load(file1)

    # ファイル2の読み込み
    with open("C:/Users/unico/Desktop/tf.json", "r", encoding="utf-8") as file2:
        data2 = json.load(file2)

    # フラグの更新
    update_flag_from_file1_to_file2(data1, data2)

    # ファイル2の書き込み
    with open("C:/Users/unico/Desktop/tf_updated.json", "w", encoding="utf-8") as updated_file2:
        json.dump(data2, updated_file2, indent=2)

if __name__ == "__main__":
    main()
