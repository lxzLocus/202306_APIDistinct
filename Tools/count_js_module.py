import os
import re
from collections import defaultdict

def find_required_modules(directory, output_file):
    module_counts = defaultdict(int)

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') or file.endswith('.gs'):
                file_path = os.path.join(root, file)
                required_modules = extract_required_modules(file_path)
                for module in required_modules:
                    module_counts[module] += 1

    with open(output_file, 'w') as output:
        for module, count in module_counts.items():
            output.write(f'{module} (used {count} times)\n')

def extract_required_modules(file_path):
    required_modules = set()
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        matches = re.findall(r'require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', content)
        required_modules.update(matches)
    return required_modules

if __name__ == "__main__":
    # ハードコーディングされたパス
    main_directory = "C:/Users/unico/Desktop/rep"
    output_file = "C:/Users/unico/Desktop/output.txt"

    find_required_modules(main_directory, output_file)
    print("プログラムが完了しました。")
