const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/********Initialize*******/
/*main Prog*/
const mainScript = 'D:/WorkSpace/e_drive/202306/Esprima_jp/main.js';

/*Editing Code*/
const scriptToRun = "E:/Files/workspace/202306/git-nature-js/#Google App Scripts/tmp.js";

/*Repository*/
const reqFolder = 'D:/WorkSpace/e_drive/202306/git-nature-js/#sort_extension/gs';

/*result*/
let editingcode_res;
let reqFolder_res;

/*main.js*/
const main = require(mainScript);

/*********Prog********/
/*Editing Code*/
editingcode_res = main(scriptToRun);

//エラーコード
if (editingcode_res.length !== 3) {
  /*reqFolder Codes*/
  reqFolder_res = processFilesInFolder(reqFolder); // メインの処理を開始
}

function processFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    // ファイル名をアルファベット順にソート
    files.sort();

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        let rtn;
        rtn = main(filePath); // ファイルの場合、main 関数を実行

        if (rtn[0] === true && rtn[4] === true && rtn[1] === editingcode_res[1]) {
          console.log('推薦コード');
        }
      } else if (stats.isDirectory()) {
        processFilesInFolder(filePath); // サブディレクトリの場合、再帰的に処理
      }
    });
  } catch (err) {
    console.error('ディレクトリを読み込む際にエラーが発生しました:', err);
  }
}
