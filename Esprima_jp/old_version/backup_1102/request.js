const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/********Initialing*******/

/*main Prog*/
const mainScript = 'D:\\WorkSpace\\e_drive\\202306\\Esprima_jp\\main.js';
/*Editing Code*/
const scriptToRun = "E:\\Files\\workspace\\202306\\git-nature-js\\#Google App Scripts\\post_light.gs"; // 実行したいスクリプトファイルの名前を変数に設定
/*Repository*/
const reqFolder = 'D:\\WorkSpace\\e_drive\\202306\\git-nature-js\\#sort_extension\\gs';



function runScriptWithArguments(mainScript, targetCode) {
  return new Promise((resolve, reject) => {
    let stdoutData = ''; // stdoutからのデータを格納する変数

    const child = spawn('node', [mainScript, targetCode]);

    child.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
      stdoutData += data; // stdoutからのデータを変数に追加
    });

    child.stderr.on('data', function (data) {
      console.error('stderr: ' + data);
    });

    child.on('close', function (code) {
      console.log('child process exited with code ' + code);
      resolve(stdoutData); // stdoutDataを解決することで実行結果を返します
    });
  });
}






// 関数を使用して子プロセスを実行
runScriptWithArguments(mainScript, scriptToRun)
  .then((result) => {
    // 実行結果がresultとして返されます
    console.log('Execution result: ' + result);
  })
  .catch((error) => {
    console.error('Error:', error);
  });


// reqFolder内のファイルをリストアップ
fs.readdir(reqFolder, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // ファイルごとに処理
  files.forEach((file) => {
    const filePath = path.join(reqFolder, file);

    runScriptWithArguments(mainScript, filePath)
      .then((result) => {
        // 各ファイルの実行結果がresultとして返されます
        console.log(`Execution result for ${filePath}: ${result}`);
      })
      .catch((error) => {
        console.error(`Error for ${filePath}:`, error);
      });
  });
});
