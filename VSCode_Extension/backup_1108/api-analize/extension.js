// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { create } = require('domain');
const { spawn } = require('child_process');
const vscode = require('vscode');


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	/*VSCode API*/
	const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
	button.command = 'api-analyze.analyzeCode';
	button.text = 'API整合性';
	context.subscriptions.push(button);
	button.show();


	const disposable = vscode.commands.registerCommand('api-analyze.analyzeCode', () => {
		
		/**Run Analyze Program**/
		const script = 'D:/WorkSpace/e_drive/202306/Esprima_jp/request.js';


		// アクティブなテキストエディタを取得
		const activeTextEditor = vscode.window.activeTextEditor;

		if (activeTextEditor) {
			// アクティブなテキストエディタのファイルURIを取得
			const fileUri = activeTextEditor.document.uri;

			// URIをファイルのフルパスに変換
			const filePath = fileUri.fsPath;

			const process = spawn('node', [script, filePath]);

			process.stdout.on('data', (data) => {
				console.log(`${data}`);
			});

			process.stderr.on('data', (data) => {
				console.error(`スクリプトのエラー: ${data}`);
			});
		} else {
			console.error('アクティブなテキストエディタがありません。');
		}
	});

	context.subscriptions.push(disposable);


}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}





/*Add function*/
