const fs = require('fs');
const path = require('path');

/*main Prog*/
const main = require('D:/WorkSpace/e_drive/202306/Esprima_jp/main.js');

// 新しいプロパティのデフォルト値
const defaultProperties = {
  nat: false,
  endp: null
};

// JSON ファイルの読み込みと書き込みのパス
const inputJsonFilePath = 'C:/Users/unico/Desktop/tf/tf_updated.json';
const outputJsonFilePath = 'C:/Users/unico/Desktop/update.json';

// 既存のJSONファイルへの追記
function appendToJsonFile(filePath, properties) {
  try {
    // 既存の JSON ファイルを読み込み
    const existingData = fs.existsSync(outputJsonFilePath) ? JSON.parse(fs.readFileSync(outputJsonFilePath, 'utf8')) : { files: [] };

    // ファイルパスに一致するデータを探す
    const fileData = existingData.files.find(data => path.normalize(data.path) === path.normalize(filePath));


    // データが見つかった場合、プロパティの内容を更新
    if (fileData) {
      fileData.nat = properties.nat;
      fileData.endp = properties.endp;

      // JSON ファイルに書き込み
      fs.writeFileSync(outputJsonFilePath, JSON.stringify(existingData, null, 2), 'utf8');
      console.log('データがJSONファイルに追記されました。');
    }

  } catch (err) {
    console.error('JSONファイルにデータを追記する際にエラーが発生しました:', err);
  }
}


function processFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    // ファイル名をアルファベット順にソート
    files.sort();

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      // 拡張子が .gs または .js の場合に処理を実行
      if (stats.isFile() && (path.extname(filePath) === '.gs' || path.extname(filePath) === '.js')) {
        let rtn;
        rtn = main(filePath); // ファイルの場合、main 関数を実行

        if (rtn[0] === true) {
          // ファイルが条件を満たす場合、新しいプロパティを追加
          appendToJsonFile(filePath, { nat: rtn[0], endp: rtn[1] });
        }
      } else if (stats.isDirectory()) {
        processFilesInFolder(filePath); // サブディレクトリの場合、再帰的に処理
      }
    });
  } catch (err) {
    console.error('ディレクトリを読み込む際にエラーが発生しました:', err);
  }
}

// すべての JSON ファイルにプロパティを追加する関数
function addPropertiesToAllFiles() {
  try {
    // 既存の JSON ファイルを読み込み
    const existingData = fs.existsSync(inputJsonFilePath) ? JSON.parse(fs.readFileSync(inputJsonFilePath, 'utf8')) : { files: [] };

    // すべてのデータにプロパティを追加
    existingData.files.forEach((fileData) => {
      fileData.nat = defaultProperties.nat;
      fileData.endp = defaultProperties.endp;
    });

    // JSON ファイルに書き込み
    fs.writeFileSync(outputJsonFilePath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log('全てのJSONファイルにプロパティが追加されました。');
  } catch (err) {
    console.error('JSONファイルにデータを追記する際にエラーが発生しました:', err);
  }
}

// メインの実行
addPropertiesToAllFiles();
processFilesInFolder('D:/WorkSpace/e_drive/202306/git-nature-js/#experiment');
