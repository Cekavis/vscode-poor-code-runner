import * as vscode from 'vscode';
import { CodeManager } from './codeManager';
import { SampleManager } from './sampleManager';

export function activate(context: vscode.ExtensionContext) {

	//C:\Users\cmxrynp\AppData\Roaming\Code\User\globalStorage\cekavis.poor-code-runner\samples.json
	const storagePath = context.globalStoragePath+'\\samples.json';
	const codeManager = new CodeManager();
	const sampleManager = new SampleManager(storagePath);
	
	vscode.window.onDidCloseTerminal(() => {
		codeManager.onDidCloseTerminal();
	});
	sampleManager.update(codeManager.getFile());
	vscode.window.onDidChangeActiveTextEditor(() => {
		sampleManager.update(codeManager.getFile());
	});

	const compile = vscode.commands.registerCommand('extension.compile', () => {
		codeManager.compile();
	});
	const run = vscode.commands.registerCommand('extension.run', () => {
		codeManager.run();
	});
	const compileRun = vscode.commands.registerCommand('extension.compileRun', () => {
		codeManager.compileRun();
	});
	const testTime = vscode.commands.registerCommand('extension.testTime', () => {
		codeManager.testTime();
	});
	const batchTest = vscode.commands.registerCommand('extension.batchTest', () => {
		codeManager.batchTest(sampleManager.samples());
	});
	const killTimeTest = vscode.commands.registerCommand('extension.killTimeTest', () => {
		codeManager.killTimeTest();
	});
	const setUrl = vscode.commands.registerCommand('extension.setUrl', () => {
        vscode.window.showInputBox({
			password:false,
			ignoreFocusOut:true,
            prompt:'请输入该文件对应的题目网址',
        }).then(function(url){
            console.log('User input: ', url);
			sampleManager.update(codeManager.getFile(), url);
        });
	});

	context.subscriptions.push(compile);
	context.subscriptions.push(run);
	context.subscriptions.push(compileRun);
	context.subscriptions.push(testTime);
	context.subscriptions.push(batchTest);
	context.subscriptions.push(killTimeTest);
	context.subscriptions.push(setUrl);
}

export function deactivate() {}
