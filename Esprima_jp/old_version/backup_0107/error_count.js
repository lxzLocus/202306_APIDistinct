const fs = require('fs');
const path = require('path');

//ReadFile
//ResponseCSV
const csvFilePath = 'D:/Workspace/e_drive/202306/Response/random_12291414.csv';
//True or flase json
const jsonFilePath = 'D:/Workspace/e_drive/202306/API_json/tf/true_or_false.json';

//WriteFile
// 現在の日時を取得し、MMDDHHmm 形式に整形
const now = new Date();
const formattedDate = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

// ファイル名を組み立て
const outputFileName = `result_${formattedDate}.csv`;

const resultCsvFilePath = 'D:/Workspace/e_drive/202306/Response/' + outputFileName;


// 読み込むCSVファイルのパス
const csvContent = fs.readFileSync(csvFilePath, 'utf-8').trim();
// JSONファイルの読み込み
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
// CSVデータを行ごとに分割
const csvRows = csvContent.split('\n');


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
  fs.writeFileSync(resultCsvFilePath, resultCsvContent, 'utf-8');
  console.log('Process completed. Check the result in result.csv');
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
