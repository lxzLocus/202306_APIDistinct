import json

def remove_property(json_data, property_name):
    for file_data in json_data['files']:
        if property_name in file_data:
            del file_data[property_name]

def main():
    # 元のJSONファイルのパス
    input_file_path = 'C:/Users/unico/Desktop/update.json'
    # 出力するJSONファイルのパス
    output_file_path = 'C:/Users/unico/Desktop/241225.json'
    # 削除するプロパティの名前
    property_to_remove = 'nat'

    # JSONファイルの読み込み
    with open(input_file_path, 'r', encoding='utf-8') as input_file:
        json_data = json.load(input_file)

    # プロパティの削除
    remove_property(json_data, property_to_remove)

    # 新しいJSONファイルの保存
    with open(output_file_path, 'w') as output_file:
        json.dump(json_data, output_file, indent=2)

    print(f'プロパティ "{property_to_remove}" を削除して、新しいファイル "{output_file_path}" を作成しました。')

if __name__ == '__main__':
    main()
