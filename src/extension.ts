import * as vscode from 'vscode';
import { CodeManager } from './codeManager';
import { SampleManager } from './sampleManager';

export function activate(context: vscode.ExtensionContext) {

	const storagePath = context.globalStoragePath+'\\samples.json';
	const codeManager = new CodeManager();
	const sampleManager = new SampleManager(storagePath);
	
	vscode.window.onDidCloseTerminal(() => {
		codeManager.onDidCloseTerminal();
	});
	sampleManager.update();
	vscode.window.onDidChangeActiveTextEditor(() => {
		sampleManager.update();
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
	const fetchSamples = vscode.commands.registerCommand('extension.fetchSamples', () => {
		sampleManager.fetchSamples();
	});
	const batchTest = vscode.commands.registerCommand('extension.batchTest', () => {
		codeManager.batchTest(storagePath, sampleManager.problemId());
	});
	const killTimeTest = vscode.commands.registerCommand('extension.killTimeTest', () => {
		codeManager.killTimeTest();
	});

	context.subscriptions.push(compile);
	context.subscriptions.push(run);
	context.subscriptions.push(compileRun);
	context.subscriptions.push(testTime);
	context.subscriptions.push(fetchSamples);
	context.subscriptions.push(batchTest);
	context.subscriptions.push(killTimeTest);
}

export function deactivate() {}
