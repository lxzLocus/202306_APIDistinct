const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/********Initialize*******/
/*main Prog*/
const mainScript = 'D:/WorkSpace/e_drive/202306/Esprima_jp/main.js';

/*Repository*/
const experimentFolder = 'D:/WorkSpace/e_drive/202306/git-nature-js/#experiment';

// 出力先のディレクトリパスをハードコーディング
const outputDirectoryPath = 'D:/WorkSpace/e_drive/202306/Response';

// 現在の日時を取得し、MMDDHHmm 形式に整形
const now = new Date();
const formattedDate = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

// ファイル名を組み立て
const outputFileName = `random_${formattedDate}.csv`;

// 出力先のファイルパスを作成
const outputFilePath = path.join(outputDirectoryPath, outputFileName);

/*main.js*/
const main = require(mainScript);

/*********Program********/
/*グローバル変数としてファイルパスのリストを初期化*/
var filePathList = [];

/*ファイル数*/
let ttl_files = countTotalFiles(experimentFolder);

/*リスト作成*/
createFilePathList(experimentFolder);

/*CSV ファイルのヘッダー*/
let csvContent = 'Iteration,SelectedFile,endp,MatchingFiles,TotalFiles,RecommendedFilePath\n';
let editingcode_res;

/*ファイルリスト*/
const fileListOutputPath = path.join(outputDirectoryPath, 'random_fileList.csv');
let fileListContent = 'FileList\n';

// ファイルパスのリストをアルファベット順にソート
filePathList.sort();

// ファイルパスをCSVに追加
filePathList.forEach((filePath) => {
  fileListContent += `${filePath}\n`;
});

// CSVファイルに書き込み
fs.writeFileSync(fileListOutputPath, fileListContent, 'utf-8');
console.log('File List CSV書き込み終了');

for (let i = 0; i < ttl_files; i++) {
  /*Editing Code (Random file)*/
  let selectedFile = getRandomFilePath(filePathList);
  editingcode_res = main(selectedFile);

  // エラーコード
  if (editingcode_res.length !== 3) {
    /*reqFolder Codes*/
    let matchingFiles = processFilesInFilePathList([...filePathList]); // メインの処理を開始

    // 推薦コードが true になったファイルパスのリスト
    let recommendedFilePathList = [];
    filePathList.forEach((filePath) => {
      let rtn;
      rtn = main(filePath);

      if (rtn[0] === true && rtn[4] === true && rtn[1] === editingcode_res[1]) {
        recommendedFilePathList.push(filePath);
        console.log('推薦コード');
      }
    });

    // CSV にデータを追加
    csvContent += `${i + 1},${selectedFile},${editingcode_res[1]},${matchingFiles},${ttl_files - i},"${recommendedFilePathList.join(';')}"\n`;
  }
}

// CSV ファイルに書き込み
fs.writeFileSync(outputFilePath, csvContent, 'utf-8');
console.log('CSV書き込み終了');


/*********Functions********/
/*推薦コード探索*/
function processFilesInFilePathList(filePaths) {
  let matchingFilesCount = 0;

  // ファイルパスのリストをアルファベット順にソート
  filePaths.sort();

  filePaths.forEach((filePath) => {
    let rtn;
    rtn = main(filePath); // ファイルの場合、main 関数を実行

    if (rtn[0] === true && rtn[4] === true && rtn[1] === editingcode_res[1]) {
      console.log('推薦コード');
      matchingFilesCount++;
    }
  });

  return matchingFilesCount;
}

/*ファイル総数カウント*/
function countTotalFiles(folderPath) {
  let totalFiles = 0;

  function countFilesRecursively(folderPath) {
    try {
      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile() && ['.gs', '.js'].includes(path.extname(file).toLowerCase())) {
          totalFiles++;
        } else if (stats.isDirectory() && !filePath.includes('node_modules')) {
          countFilesRecursively(filePath); // サブディレクトリの場合、再帰的に処理
        }
      }
    } catch (err) {
      console.error('ディレクトリを読み込む際にエラーが発生しました:', err);
    }
  }

  countFilesRecursively(folderPath);
  return totalFiles;
}

/*リスト作成*/
function createFilePathList(rootPath) {
  const fs = require('fs');
  const path = require('path');

  function traverseDirectory(currentPath) {
    try {
      const files = fs.readdirSync(currentPath);

      for (const file of files) {
        const filePath = path.join(currentPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          // 拡張子が .gs または .js の場合にのみリストに追加
          if (['.gs', '.js'].includes(path.extname(file).toLowerCase())) {
            filePathList.push(filePath);
          }
        } else if (stats.isDirectory() && !filePath.includes('node_modules')) {
          traverseDirectory(filePath); // サブディレクトリの場合、再帰的に処理
        }
      }
    } catch (err) {
      console.error('ディレクトリを読み込む際にエラーが発生しました:', err);
    }
  }

  // ルートディレクトリから開始
  traverseDirectory(rootPath);

  // 完成したファイルパスのリストを返す
  return filePathList;
}

/*ランダム化*/
function getRandomFilePath(filePathList) {
  if (filePathList.length === 0) {
    // リストが空の場合は何もしない
    return null;
  }

  // ランダムなインデックスを生成
  const randomIndex = Math.floor(Math.random() * filePathList.length);

  // ランダムなファイルパスを取得
  const randomFilePath = filePathList[randomIndex];

  // 取得したファイルパスをリストから削除
  filePathList.splice(randomIndex, 1);

  // ランダムなファイルパスを返す
  return randomFilePath;
}
