import json

# 入力ファイルパス
input_file = r"D:\WorkSpace\e_drive\202306\natureapi.json"

# 出力ファイルパス
output_file = r"D:\WorkSpace\e_drive\202306\nature_sort_ts.json"

# JSONファイルの読み込み
with open(input_file, "r") as json_file:
    data = json.load(json_file)

# API情報を取得し、並び替え
api_list = []
paths = data["paths"]
for path, methods in paths.items():
    for method, info in methods.items():
        api = {
            "name": path,
            "method": method.upper(),
            "endpoint": path,
            "parameters": info.get("parameters", None),
            "headers": info.get("headers", None),
            "requestBody": info.get("requestBody", None),
            "responses": info.get("responses", None),
            "description": info.get("description", None)
        }
        api_list.append(api)

# 新しいJSONファイルに出力
output_data = {"apis": api_list}
with open(output_file, "w") as json_file:
    json.dump(output_data, json_file, indent=4)
