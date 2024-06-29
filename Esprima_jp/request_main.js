const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/********Initialize*******/
/*main Prog*/
const mainScript = './main.js';

/*Editing Code*/
const scriptToRun = "../Datasets/#Google App Scripts/tmp.js";

/*Repository*/
const reqFolder = '../Datasets/#experiment/git';


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
        // Check if the file has a .js or .gs extension
        const isJsOrGsFile = /\.(js|gs)$/i.test(path.extname(filePath));

        if (isJsOrGsFile) {
          let rtn;
          rtn = main(filePath); // ファイルの場合、main 関数を実行

          //return [url_logic[0](URL), url_logic[1](Endpoint), opt_logic[0], opt_logic[1], param_logic[0](method), param_logic[1], param_logic[2], param_logic[3]];
          //url_logic[0](URL), param_logic[0](method) & url_logic[1](Endpoint)

          if (rtn[0] === true && rtn[4] === true && rtn[1] === editingcode_res[1]) {
            console.log('推薦コード');
          }
          console.log('');
        }

      } else if (stats.isDirectory()) {
        processFilesInFolder(filePath); // サブディレクトリの場合、再帰的に処理
      }
    });
  } catch (err) {
    console.error('ディレクトリを読み込む際にエラーが発生しました:', err);
  }
}
