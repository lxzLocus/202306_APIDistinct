const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const folderPath = 'E:\\Files\\workspace\\202306\\git-nature-js\\#sort_extension\\gs';
const searchString = '/light';

fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    const matchingFiles = files.filter((file) => {
        const filePath = path.join(folderPath, file);
        const data = fs.readFileSync(filePath, 'utf8');
        return data.includes(searchString);
    });

    if (matchingFiles.length === 0) {
        console.log(`文字列 "${searchString}" が含まれるファイルは見つかりませんでした`);
        return;
    }

    console.log(`文字列 "${searchString}" が含まれるファイルが複数見つかりました。開くファイルを選択してください。`);
    matchingFiles.forEach((file, index) => {
        console.log(`${index + 1}: ${file}`);
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('番号を入力してください: ', (answer) => {
        const selectedFileIndex = parseInt(answer) - 1;
        if (isNaN(selectedFileIndex) || selectedFileIndex < 0 || selectedFileIndex >= matchingFiles.length) {
            console.log('無効な入力です');
            rl.close();
            return;
        }

        const selectedFile = matchingFiles[selectedFileIndex];
        const filePath = path.join(folderPath, selectedFile);

        exec(`start "" "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });

        rl.close();
    });
});
