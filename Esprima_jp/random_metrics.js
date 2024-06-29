const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('csv');
const { Readable } = require('stream');

var overallMetrics = {};

/********FILE1*******/
/*Repository*/
const experimentFolder = '../Datasets/#experiment';

const outputDirectoryPath = '../Response/rand_metrics';



/*main.js*/
const main = require('./main.js');




function calculateOverallMetrics(metrics) {
  let totalTP = 0;
  let totalFP = 0;
  let totalFN = 0;
  let totalTN = 0;

  for (const endp in metrics) {
    totalTP += metrics[endp].TP;
    totalFP += metrics[endp].FP;
    totalFN += metrics[endp].FN;
    totalTN += metrics[endp].TN;
  }

  const overallPrecision = (totalTP !== 0) ? totalTP / (totalTP + totalFP) : 0;
  const overallRecall = (totalTP !== 0) ? totalTP / (totalTP + totalFN) : 0;
  const overallAccuracy = (totalTP + totalTN) / (totalTP + totalFP + totalFN + totalTN);


  // F1スコアの計算
  const overallF1Score = (overallPrecision !== 0 && overallRecall !== 0) ?
    (2 * overallPrecision * overallRecall) / (overallPrecision + overallRecall) : 0;


  return {
    precision: overallPrecision,
    recall: overallRecall,
    accuracy: overallAccuracy,
    f1Score: overallF1Score,
    totalTP,
    totalFP,
    totalFN,
    totalTN
  };
}



async function runIterations() {




  /*********Program********/
  /*グローバル変数としてファイルパスのリストを初期化*/
  var filePathList = [];

  /*ファイル数*/
  let ttl_files = countTotalFiles(experimentFolder);

  /*リスト作成*/
  createFilePathList(experimentFolder);

  /*CSV ファイルのヘッダー*/
  var csvContent = 'Iteration,SelectedFile,endp,MatchingFiles,TotalFiles,RecommendedFilePath\n';
  let editingcode_res;

  /*ファイルリスト*/
  const fileListOutputPath = path.join(outputDirectoryPath, 'ran_fileList.csv');
  let fileListContent = 'FileList\n';

  // ファイルパスのリストをアルファベット順にソート
  filePathList.sort();

  // ファイルパスをCSVに追加
  filePathList.forEach((filePath) => {
    fileListContent += `${filePath}\n`;
  });

  // CSVファイルに書き込み
  //fs.writeFileSync(fileListOutputPath, fileListContent, 'utf-8');
  //console.log('File List CSV書き込み終了');

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
  //fs.writeFileSync('C:/users/unico/desktop/tmp.csv', csvContent, 'utf-8');
  let file1_csvContent = csvContent;


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



  /********FILE 2*******/
  //ReadFile
  //True or flase json
  const jsonFilePath = '../API/tf/tf.json';

  // ファイル名を組み立て
  //const outputFileName = `res_Random${formattedDate}.csv`;
  //const outputFilePath = path.join(outputDirectoryPath, outputFileName);



  // 読み込むCSVファイルのパス
  //const csvContent = fs.readFileSync(csvFilePath, 'utf-8').trim();
  csvContent = file1_csvContent;
  // JSONファイルの読み込み
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  // CSVデータを行ごとに分割
  const csvRows = csvContent.split('\n');

  // 最後の空の行を除外
  if (csvRows.length > 0 && csvRows[csvRows.length - 1].length === 0) {
    csvRows.pop();
  }


  // エラーカウント
  let correctCounts = {};
  // 取りこぼし
  let leftCounts = {};

  // ヘッダー行を取得
  const header = csvRows[0].split(',');

  // ヘッダー行から列のインデックスを取得
  const iterationIndex = header.indexOf('Iteration');
  const selectedFileIndex = header.indexOf('SelectedFile');
  const endpIndex = header.indexOf('endp');
  const matchingFilesIndex = header.indexOf('MatchingFiles');
  const totalFilesIndex = header.indexOf('TotalFiles');
  const recommendedFilePathIndex = header.indexOf('RecommendedFilePath');
  //const recommendedFilePathIndex = header.indexOf('RecommendedFilePath\r');



  if (recommendedFilePathIndex === -1) {
    // \r を取り除いた場合でも一致が見つからない場合、エラー処理
    console.error('Error: "RecommendedFilePath" column not found in the CSV file header.');
  } else {
    //endpマップ作成
    const endpMap = make_endpMap(jsonData);


    // \r を取り除く
    const cleanHeader = header.map(column => column.replace(/\r/g, ''));
    const recommendedFilePathIndex = cleanHeader.indexOf('RecommendedFilePath');



    // ヘッダー行の中で 'CorrectCounts' の挿入位置を見つける
    const correctCountsInsertIndex = matchingFilesIndex + 1;
    header.splice(correctCountsInsertIndex, 0, 'error detect');

    // ヘッダー行の中で 'LeftCounts' の挿入位置を見つける
    const leftCountsInsertIndex = correctCountsInsertIndex + 1;
    header.splice(leftCountsInsertIndex, 0, 'Left');


    // ヘッダー行の中で 'EndpPathCount' の挿入位置を見つける
    const endpPathCountInsertIndex = matchingFilesIndex + 2;
    header.splice(endpPathCountInsertIndex, 0, 'recom tar');


    // 各コラムごとにエラーカウントをCSVに追加
    let resultCsvContent = `${header.join(',')}\n`;


    // データ行から処理
    for (let i = 1; i < csvRows.length; i++) {
      const row = csvRows[i].split(',');

      const iteration = row[iterationIndex];
      const selectedFile = row[selectedFileIndex];
      const endp = row[endpIndex];
      const matchingFiles = row[matchingFilesIndex];
      const totalFiles = row[totalFilesIndex];
      const recommendedFilePath = row[recommendedFilePathIndex] ? row[recommendedFilePathIndex].split(';').map(path => path.trim()) : [];

      // 各コラムごとにエラーカウントを初期化
      //間違えて取得
      if (!correctCounts[iteration]) {
        correctCounts[iteration] = 0;
      }

      // 各コラムごとに leftCounts を初期化
      //取りこぼし
      if (!leftCounts[iteration]) {
        leftCounts[iteration] = 0;
      }

      //リストからselectedFileの削除
      const selectedFilePathIndex = endpMap[endp].findIndex(pathInMap => normalizePath(pathInMap) === normalizePath(selectedFile));
      if (selectedFilePathIndex !== -1) {
        endpMap[endp].splice(selectedFilePathIndex, 1);
      }


      // MatchingFilesが1件以上ある場合の処理
      if (parseInt(matchingFiles) >= 1) {
        // RecommendedFilePathが空でない場合の処理
        if (recommendedFilePath.length > 0) {

          // 各RecommendedFilePathに対して処理
          for (const filePath of recommendedFilePath) {
            // RecommendedFilePathがJSONデータに存在するか確認
            const pathToCompare = filePath.replace(/\\/g, '/');
            const jsonEntry = jsonData.files.find(entry => entry.path === pathToCompare);


            //取得間違い
            // JSONデータに存在する場合かつflagがfalseの場合、エラーカウントを増やす
            if (jsonEntry !== undefined && jsonEntry.url === false) {
              correctCounts[iteration]++;
              console.log(`Error at Iteration ${iteration}: RecommendedFilePath does not match the url.`);
            }



            leftCounts[iteration] = endpMap[endp].length - matchingFiles;



          }


        }else {
          // RecommendedFilePath が空の場合の処理

          //取りこぼし件数の確認



          leftCounts[iteration]++;
          console.log(`Left at Iteration ${iteration}: No RecommendedFilePath provided.`);
        }
      }



      // エラーカウント列を追加
      const errorCount = correctCounts[iteration] || 0;
      row.splice(correctCountsInsertIndex, 0, errorCount);

      // 取りこぼし件数の列を追加
      const leftCount = leftCounts[iteration] || 0;
      row.splice(leftCountsInsertIndex, 0, leftCount);

      //EndpPathCount 列を追加
      const endpPathCount = endpMap[endp] ? endpMap[endp].length : 0;
      row.splice(endpPathCountInsertIndex, 0, endpPathCount);


      // 余分なカンマを取り除く
      const cleanedRow = row.filter(item => item !== '');
      resultCsvContent += `${cleanedRow.join(',')}\n`;
    }



    // 結果を新しいCSVファイルに書き込み
    //fs.writeFileSync(outputFilePath, resultCsvContent, 'utf-8');
    var file2_csvContent = resultCsvContent;
  }

  function make_endpMap(jsonData) {
    // エンドポイントごとのパスを格納するオブジェクト
    const endpPathsMap = {};

    // JSONファイルからエンドポイントごとにパスをリストとして取得
    for (let i = 0; i < jsonData.files.length; i++) {
      const entry = jsonData.files[i];

      // urlがtrueでfetchがtrueでない場合はスキップ
      if (entry.url !== true || entry.fetch !== true) {
        continue;
      }

      const endp = entry.endp;

      // エンドポイントが null の場合はスキップ
      if (endp === null) {
        continue;
      }

      // エンドポイントごとに配列を作成するか既存の配列を使用
      endpPathsMap[endp] = endpPathsMap[endp] || [];
      endpPathsMap[endp].push(entry.path);
    }

    return endpPathsMap;
  }

  function normalizePath(path) {
    return path.replace(/\\/g, '/');
  }






  /********FILE 3*******/
  // file2_csvContent を stream に変換する関数
  function createStringStream(content) {
    const stream = new Readable();
    stream.push(content);
    stream.push(null); // 終了シグナルを流す
    return stream;
  }

  // file2_csvContent を stream に変換
  const file2_stream = createStringStream(file2_csvContent);

  // processFile2Stream を非同期で実行
  const evaluationMetrics = {};

  file2_stream
    .pipe(csv())
    .on('data', (row) => {
      try {
        const endp = row['endp'];
        const recomTar = parseInt(row['recom tar']);
        const matchingFiles = parseInt(row['MatchingFiles']);
        const left = parseInt(row['Left']);
        const errorDetect = parseInt(row['error detect']);
        const totalFiles = parseInt(row['TotalFiles']);

        if (recomTar !== 0 && totalFiles !== 0 && matchingFiles !== 0) {
          const TP = matchingFiles;
          const FP = errorDetect;
          const FN = recomTar - matchingFiles;
          const TN = totalFiles - (TP + FP + FN);

          if (evaluationMetrics[endp]) {
            evaluationMetrics[endp].TP += TP;
            evaluationMetrics[endp].FP += FP;
            evaluationMetrics[endp].FN += FN;
            evaluationMetrics[endp].TN += TN;
          } else {
            evaluationMetrics[endp] = { TP, FP, FN, TN };
          }
        }
      } catch (error) {
        console.error('エラーが発生しました:', error.message);
      }
    })
    .on('end', () => {
      overallMetrics = calculateOverallMetrics(evaluationMetrics);
      console.log('全体の評価指標:', overallMetrics);

      // 現在の日時を取得し、MMDDHHmm 形式に整形
      const now = new Date();
      const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;


      // ファイルにデータを書き込み
      const filePath = `../Response/rand_metrics/temp/temp_${formattedDate}.json`;
      fs.writeFileSync(filePath, JSON.stringify(overallMetrics), 'utf-8');
    });

}



runIterations();