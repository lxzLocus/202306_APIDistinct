import os
import json
import subprocess

main_path = 'E:\\Files\\workspace\\202306\\Esprima_jp'
temp_folder = 'E:\\Files\\workspace\\202306\\Response\\ran_metrics\\temp'
node_script_path = os.path.join(main_path, 'random_metrics.js')

# 同時に実行するプロセスの数
num_processes = 20

# トラッキング用の変数を初期化
result_data = []
min_recall_data = None
max_recall_data = None

for _ in range(5):
    processes = []
    for _ in range(num_processes):
        process = subprocess.Popen(['node', node_script_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processes.append(process)

    # 各プロセスの終了を待つ
    for process in processes:
        _, _ = process.communicate()

# ファイル名に 'temp_' かつ '.json' であるファイルを探して配列に格納
for filename in os.listdir(temp_folder):
    if filename.startswith('temp_') and filename.endswith('.json'):
        filepath = os.path.join(temp_folder, filename)
        with open(filepath, 'r') as file:
            data = json.load(file)
            result_data.append(data)

            # 最低値と最高値をトラッキング
            if min_recall_data is None or data['recall'] < min_recall_data['recall']:
                min_recall_data = data
            if max_recall_data is None or data['recall'] > max_recall_data['recall']:
                max_recall_data = data


# 各プロパティの平均値を計算
if result_data:
    num_results = len(result_data)
    avg_precision = sum(item['precision'] for item in result_data) / num_results
    avg_recall = sum(item['recall'] for item in result_data) / num_results
    avg_accuracy = sum(item['accuracy'] for item in result_data) / num_results
    avg_f1_score = sum(item['f1Score'] for item in result_data) / num_results
    avg_total_tp = sum(item['totalTP'] for item in result_data) / num_results
    avg_total_fp = sum(item['totalFP'] for item in result_data) / num_results
    avg_total_fn = sum(item['totalFN'] for item in result_data) / num_results
    avg_total_tn = sum(item['totalTN'] for item in result_data) / num_results

    # 平均値を辞書にまとめる
    avg_metrics = {
        'precision': avg_precision,
        'recall': avg_recall,
        'accuracy': avg_accuracy,
        'f1Score': avg_f1_score,
        'totalTP': avg_total_tp,
        'totalFP': avg_total_fp,
        'totalFN': avg_total_fn,
        'totalTN': avg_total_tn
    }

    # 最低値と最高値を辞書にまとめる
    min_max_metrics = {
        'min_recall': min_recall_data,
        'max_recall': max_recall_data
    }

    # 平均値、最低値、最高値を JSON 形式でファイルに出力
    avg_output_filepath = os.path.join('E:\\Files\\workspace\\202306\\Response\\ran_metrics', 'avg_metrics.json')
    with open(avg_output_filepath, 'w') as avg_file:
        json.dump({'avg_metrics': avg_metrics, 'min_max_metrics': min_max_metrics}, avg_file, indent=2)

    print({'avg_metrics': avg_metrics, 'min_max_metrics': min_max_metrics})
else:
    print('No result data to calculate averages.')

# ファイル名に 'temp_' かつ '.json' であるファイルを削除	
for filename in os.listdir(temp_folder):	
    if filename.startswith('temp_') and filename.endswith('.json'):	
        filepath = os.path.join(temp_folder, filename)	
        os.remove(filepath)