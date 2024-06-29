import json

# 入力ファイルパス
input_file = r"D:\WorkSpace\e_drive\202306\natureapi.json"

# 出力ファイルパス
output_file = r"C:\Users\unico\Desktop\tmp.json"

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

# 新しいJSONデータを作成
output_data = {
    "nature_apis": {
        "servers": data.get("servers", []),
        "api": api_list,
        "schemas": data.get("components", {}).get("schemas", {})
    }
}

# 新しいJSONデータの"schemas"セクションに複数のキーを追加
if "components" in data and "schemas" in data["components"]:
    output_data["nature_apis"]["schemas"] = data["components"]["schemas"]

# 新しいJSONファイルに出力
with open(output_file, "w") as json_file:
    json.dump(output_data, json_file, indent=4)
