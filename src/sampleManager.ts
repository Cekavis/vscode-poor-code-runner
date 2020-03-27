import * as vscode from 'vscode';
import * as superagent from 'superagent';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

export class SampleManager{
    private statusDisplay: vscode.StatusBarItem;
    private storagePath: string;
    public currentUrl: string | undefined;
    constructor(storagePath: string){
        this.statusDisplay = vscode.window.createStatusBarItem();
        this.storagePath = storagePath;
    }
    public update(file: any, url?: string){
        const doc = vscode.window.activeTextEditor?.document;
        if(!doc || doc.languageId !== 'cpp') {return this.display(undefined, false);}

        const isManual = url !== undefined;
        this.initStorage(() => {
            if(!isManual){
                let content = JSON.parse(fs.readFileSync(this.storagePath).toString());
                if(!content.url){ content.url={};}
                if(content.url[file.path]){
                    url = content.url[file.path];
                }
                else{
                    url = "";
                }
            }
            if(url === ""){
                const res = /(\d+)\s*([a-zA-Z]\d*)/g.exec(file.title);
                if(!res || res.length<3) {return this.display();}
                let [, cfCId, cfPId] = res.values();
                cfPId = cfPId.toUpperCase();
                url = 'https://codeforces.com/contest/'+cfCId+'/problem/'+cfPId;
            }
            this.display(url);

            fs.readFile(this.storagePath, (err, data) => {
                if(err){ return console.error(err);}
                let content = JSON.parse(data.toString());
                if(!content.url){ content.url={};}
                content.url[file.path]=this.currentUrl;
                fs.writeFile(this.storagePath, JSON.stringify(content), (err) => {
                    if(err){ return console.error(err);}
                    console.log('Push url successful');
                    this.fetchSamples(isManual);
                });
            });
        });
    }
    public samples(): any[]{
        if(!this.currentUrl){
            vscode.window.showErrorMessage('Can\'t find the problem');
            return [];
        }
        this.initStorage();
        return JSON.parse(fs.readFileSync(this.storagePath).toString()).samples[this.currentUrl];
    }
    public fetchSamples(force: boolean = false){
        if(!this.currentUrl) { return console.error('Can\'t find the corresponding problem.');}
        this.initStorage();
        
        if(!force){
            try{
                let origin = fs.readFileSync(this.storagePath);
                if(JSON.parse(origin.toString()).samples[this.currentUrl]){
                    return;
                }
            } catch (err){
                console.error(err);
            }
        }
        else{
            console.log('Force');
        }
        
        let samples:any[] = [];
        superagent.get(this.currentUrl).end((err, res) => {
            if (err) {
                vscode.window.showErrorMessage(`访问失败 - ${err}`);
                return;
            } else {
                samples = extractSamples(res);
                if(!samples.length){
                    return;
                }
                // console.log(samples);
                fs.readFile(this.storagePath, (err, data) => {
                    if(err){ return console.error(err);}
                    let content = JSON.parse(data.toString());
                    if(!content.samples){ content.samples={};}
                    content.samples[this.currentUrl!]=samples;
                    fs.writeFile(this.storagePath, JSON.stringify(content), (err) => {
                        if(err){ return console.error(err);}
                        console.log('Push samples successful');
                    });
                });
            }
        });
        let extractSamples = (res:superagent.Response) => {
            let inputs: string[] = [];
            let outputs: string[] = [];
            let samples: any[] = [];
            let $ = cheerio.load(res.text);
        
            if(this.currentUrl!.includes('codeforces')){
                $('div.input pre').each((idx, ele) => {
                    inputs.push($(ele).text());
                });
                $('div.output pre').each((idx, ele) => {
                    outputs.push($(ele).text());
                });
            }
            else if(this.currentUrl!.includes('atcoder')){
                $('pre').each((idx, ele) =>{
                    const prev = $(ele).prev();
                    if(prev.text().startsWith('Sample Input')){
                        inputs.push($(ele).text());
                    }
                    if(prev.text().startsWith('Sample Output')){
                        outputs.push($(ele).text());
                    }
                });
            }
            else{
                vscode.window.showErrorMessage('Unsupported site.');
                return [];
            }

            // console.log(inputs);
            // console.log(outputs);
            // console.log(samples);

            inputs.forEach((value, index, array) => {
                samples.push({'input': value, 'output': outputs[index]});
            });
            return samples;
        };
    }

    private initStorage(callback?: () => void){
        const dir = this.storagePath.substr(0, this.storagePath.length-12);
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        if(!fs.existsSync(this.storagePath)){
            fs.writeFileSync(this.storagePath, '{}');
        }
        if(callback){ callback();}
    }
    private display(url?:string, show:boolean = true){
        this.statusDisplay.command = 'extension.setUrl';
        this.currentUrl = url;
        if(!url){
            this.statusDisplay.text = 'Not specified';
        }
        else{
            this.statusDisplay.text = url;
            // this.statusDisplay.command = '';
        }
        if(show) {this.statusDisplay.show();}
    }
}