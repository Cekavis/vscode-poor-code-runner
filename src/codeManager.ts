import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as os from 'os';

export class CodeManager{
    private channel: vscode.OutputChannel;
    private terminal: vscode.Terminal | undefined;
    private currentProcess: child_process.ChildProcess | undefined;
    constructor() {
        this.channel = vscode.window.createOutputChannel('Poor Code Runner');
    }
    public compile(callback?: (() => void)){
        vscode.window.activeTextEditor?.document.save().then(() => {
            const file = this.getFile();
            if(fs.existsSync(file.directory + '\\' + file.executable)){
                try {
                    fs.unlinkSync(file.directory + '\\' + file.executable);
                } catch(err) {
                    if(err) {console.error(err);}
                    else {console.log('Successfully deleted executable.');}
                }
            }
            else {console.log('No executable exists.');}
            this.executeCommandInTerminal('cd \"' + file.directory + '\"');
            this.executeCommandInTerminal('clear');
            let compilerFlags = vscode.workspace.getConfiguration('poor-code-runner').get('compilerFlags');
            if(os.platform()==='win32'){ compilerFlags+=' \"-Wl,--stack=998244353\"';}
            this.executeCommandInTerminal('g++ "' + file.name + '" -o "' + file.executable + '" ' + compilerFlags);
            if(callback){
                callback();
            }
        });
    }
    public run(){
        const file = this.getFile();

        const process = child_process.exec(this.externalExecutionCommand(), {shell: this.shell()});
        // if(process.status === 0){
        // 	vscode.window.showInformationMessage('Ran successfully!');
        // }
        // else{
        // 	vscode.window.showErrorMessage('Error running!');
        // 	console.log(process.output);
        // 	// const channel = vscode.window.createOutputChannel('Poor Code Runner');
        // 	// channel.clear();
        // 	// channel.appendLine(process.output);
        // 	// channel.show();
        // }
    }
    public compileRun(){
        const file = this.getFile();
        this.compile(() => {
            this.executeCommandInTerminal(this.externalExecutionCommand());
        });
    }
    public testTime(){
        this.channel.show(true);
        if(this.currentProcess){
            this.channel.appendLine('Something is running now. Please try again later.');
            return;
        }
        const file = this.getFile();
        if(os.platform()==='win32'){
            this.channel.clear();
            this.channel.appendLine('Start running ...');
            this.currentProcess = child_process.exec(`powershell "cd \\"${file.directory}\\"; Measure-Command{&\\"${file.executablePath}\\"}"`, (error, stdout, stderr) => {
                console.log(`powershell "cd \\"${file.directory}\\"; Measure-Command{&\\"${file.executablePath}\\"}"`);
                let seconds = stdout.split('\n')[11];
                this.channel.appendLine(seconds);
                let milliseconds = stdout.split('\n')[12];
                this.channel.appendLine(milliseconds);
                this.currentProcess = undefined;
            });
        }
        else{
            this.executeCommandInTerminal('cd \"' + file.directory + '\"');
            this.executeCommandInTerminal('clear');
            this.executeCommandInTerminal(`time ./"${file.executable}"`);
        }
        // require("child_process").exec(`start cmd /c ".\\\"${file.executable}\""`, {cwd: file.directory}, () => {
        //     const duration = process.hrtime(startTime);
        //     const channel = vscode.window.createOutputChannel('Poor Code Runner time test');
        //     channel.appendLine(duration.toString());
        //     channel.show();
        // });
    }
    public killTimeTest(){
        if(!this.currentProcess){
            this.channel.show(true);
            this.channel.appendLine('Nothing to kill.');
            return;
        }
        this.currentProcess.kill();
        this.channel.appendLine('Killed successfully.');
        this.currentProcess = undefined;
    }
    public onDidCloseTerminal(){
        this.terminal = undefined;
    }
    public batchTest(samples: Promise<any>){
        samples.then((samples) => {
            console.log('batchTest: ', samples);
            if(samples === undefined){ throw new Error('Samples not find.');}
            const file = this.getFile();
            this.channel.clear();
            this.channel.show(true);
            samples.forEach((ele: { input: string; output: string;}, index: number) => {
                this.channel.append(`Running test ${index} (Time limit is 5000 ms) ... `);
                try{
                    let stdout = child_process.execFileSync(file.executablePath, [], {input: ele.input, timeout: 5000}).toString();
                    if(this.compare(stdout, ele.output)){
                        this.channel.appendLine('Passed.');
                    }
                    else{
                        this.channel.appendLine('Wrong Answer.\nYour Output:\n' + stdout);
                    }
                } catch(err) {
                    this.channel.appendLine('Failed to execute! Maybe your program have got RE.');
                    throw new Error;
                }
            });
        });
    }
    public getFile() {
        if (!vscode.window || !vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
            throw new Error('Invalide active text editor document!');
        }
        const doc = vscode.window.activeTextEditor.document;
        return {
            path: doc.fileName,
            name: path.basename(doc.fileName),
            title: path.basename(doc.fileName, path.extname(doc.fileName)),
            directory: path.dirname(doc.fileName),
            executable: process.platform === 'win32'
                ? `${path.basename(doc.fileName, path.extname(doc.fileName))}.exe`
                : path.basename(doc.fileName, path.extname(doc.fileName)),
            executablePath: path.dirname(doc.fileName)+(process.platform === 'win32'
            ? `\\${path.basename(doc.fileName, path.extname(doc.fileName))}.exe`
            : '/'+path.basename(doc.fileName, path.extname(doc.fileName)))
        };
    }


    private reduce(s: string):string {
        s = s.replace('\r\n', '\n');
        s = s.replace(/\s+\n/g, '\n');
        s = s.replace(/\s+(?![\s\S])/g, '');
        return s;
    };
    private compare (a: string, b: string) {
        return this.reduce(a)===this.reduce(b);
    };
    private externalExecutionCommand() {
        const file = this.getFile();
        return os.platform()==='win32'
            ? `start cmd "/c ""cd ""${file.directory}"" & .\\""${file.executable}"" & echo. & pause"""`
            : `gnome-terminal -t '${file.title}' -- bash -c "cd '${file.directory}'; ./'${file.executable}'; read -rsp $'Press any key to continue...\\n' -n1 key"`;
    }
    private shell(){
        return os.platform()==='win32'
            ? 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
            : undefined;
    }
    private executeCommandInTerminal(command: string) {
        if(!this.terminal){
            this.terminal = vscode.window.createTerminal(
                'Poor Code Runner',
                this.shell()
            );
        }
        this.terminal.show(true);
        this.terminal.sendText(command);
    }
}