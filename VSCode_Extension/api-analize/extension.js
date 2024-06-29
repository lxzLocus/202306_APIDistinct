// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { create } = require('domain');
const { exec } = require('child_process');
const vscode = require('vscode');

const fs = require('fs');
const path = require('path');
const readline = require('readline');


/*Initialize*/
/*Run Analyze Program Path*/
const script = 'D:/WorkSpace/e_drive/202306/Esprima_jp/main.js';
const main = require(script);
/*Repository Path*/
const reqFolder = 'D:/WorkSpace/e_drive/202306/git-nature-js/#experiment';
/*Result*/
let editingcode_res;
let reqFolder_res;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	/*VSCode API*/
	const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
	button.command = 'api-analyze.analyzeCode';
	button.text = 'API整合性';
	context.subscriptions.push(button);
	button.show();



	const disposable = vscode.commands.registerCommand('api-analyze.analyzeCode', async () => {

		/*Active Text Editor Path*/
		const activeTextEditor = vscode.window.activeTextEditor;

		if (activeTextEditor) {
			// アクティブなテキストエディタのファイルURIを取得
			const fileUri = activeTextEditor.document.uri;
			// URIをファイルのフルパスに変換
			const filePath = fileUri.fsPath;



			/*********Prog********/
			/*Editing Code*/
			editingcode_res = main(filePath);

			//エラーコード
			if (editingcode_res.length != 3) {
				/*reqFolder Codes*/
				reqFolder_res = processFilesInFolder(reqFolder); // メインの処理を開始

				if (reqFolder_res.length !== 0) {
					vscode.window.showInformationMessage(`推薦できるファイル ${reqFolder_res.length}件`);
					const items = reqFolder_res.map((filePath, index) => ({
						label: `File ${index + 1}`,
						description: filePath,
					}));

					vscode.window.showQuickPick(items, {
						placeHolder: 'ファイルを選択してください',
					}).then(selectedFile => {
						if (selectedFile) {
							const selectedFilePath = selectedFile.description;
							vscode.workspace.openTextDocument(selectedFilePath).then(document => {
								vscode.window.showTextDocument(document);
							});

							// 差分を取得
							getDiff(filePath, selectedFilePath)
							/*
								.then(diffContent => {
									// HTMLに差分を表示
									showDiffInHtml(diffContent);
								})
								.catch(error => {
									console.error('Error getting diff:', error);
								});
								*/
						}
					});

				} else {
					vscode.window.showInformationMessage('推薦できるファイルがありません');
				}
			} else {
				console.error('Expected ActiveCode');
				vscode.window.showInformationMessage(`エラー : ${editingcode_res}`);
			}

		} else {
			console.error('アクティブなテキストエディタがありません。');
		}

	});


	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}





/*Add function*/
function processFilesInFolder(folderPath) {
	const recomm_path = [];
	const stack = [folderPath];

	while (stack.length > 0) {
		const currentPath = stack.pop();

		const files = fs.readdirSync(currentPath);
		for (const file of files) {
			const filePath = path.join(currentPath, file);

			const stats = fs.statSync(filePath);

			if (stats.isFile()) {
				// Check file extension before processing
				const fileExtension = path.extname(filePath).toLowerCase();
				if (fileExtension === '.gs' || fileExtension === '.js') {
					// ファイルの場合、main 関数を実行
					const rtn = main(filePath);
					if (rtn[0] === true && rtn[4] === true && rtn[1] === editingcode_res[1]) {
						recomm_path.push(filePath);
					}
				}
			} else if (stats.isDirectory()) {
				// サブディレクトリの場合、スタックに追加して後で探索
				stack.push(filePath);
			}
		}
	}

	return recomm_path;
}

function getDiff(file1, file2) {
	const uri1 = vscode.Uri.file(path.resolve(file1));
	const uri2 = vscode.Uri.file(path.resolve(file2));

	vscode.commands.executeCommand('vscode.diff', uri1, uri2);
}



function showDiffInHtml(diffContent) {
	const panel = vscode.window.createWebviewPanel(
		'diffViewer',
		'Diff Viewer',
		vscode.ViewColumn.One,
		{}
	);

	panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                ${getCssStyles()} // CSSスタイルを取得する関数を呼び出す
            </style>
        </head>
        <body>
            <pre>${escapeHtml(diffContent)}</pre>
        </body>
        </html>
    `;
}


function getCssStyles() {
	// 任意のCSSスタイルを追加できます
	return `
        body {
            font-family: 'Courier New', Courier, monospace;
        }
    `;
}

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}