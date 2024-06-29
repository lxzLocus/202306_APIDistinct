const fs = require('fs');

// JSONファイルのパス
const jsonFilePath = 'C:/Users/unico/Desktop/tf/241225.json';

let tmp = 0;

// JSONファイルの読み込み
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);


    // ファイルの情報をチェックして条件に合致するものをコンソールに出力
    jsonData.files.forEach((file) => {
      if (file.url === true && file.endp != null && file.fetch === true) {
        console.log(file.path);
        tmp++;
      }
    });
    console.log(tmp);
  } catch (jsonError) {
    console.error('Error parsing JSON:', jsonError);
  }
});
