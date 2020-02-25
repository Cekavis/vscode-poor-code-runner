import * as vscode from 'vscode';
// import * as express from 'express';
import * as superagent from 'superagent';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

export class SampleManager{
    private statusDisplay: vscode.StatusBarItem;
    private storagePath: string;
    public currentId: string[] | undefined;
    constructor(storagePath: string){
        this.statusDisplay = vscode.window.createStatusBarItem();
        this.storagePath = storagePath;
    }
    public update(){
        const doc = vscode.window.activeTextEditor?.document;
        if(!doc || doc.languageId!=='cpp') {return this.display(undefined, false);}
        const title = path.basename(doc.fileName, path.extname(doc.fileName));
        const res = /(\d+)\s*([a-zA-Z]\d*)/g.exec(title);
        if(!res || res.length<3) {return this.display();}
        console.log(res);
        let [, contestId, problemId] = res.values();
        problemId = problemId.toUpperCase();
        console.log(contestId, problemId);
        this.display([contestId, problemId]);
        this.fetchSamples();
    }
    public fetchSamples(){
        if(!this.currentId) { return console.error('Can\'t find the corresponding problem.');}
        
        let origin;
        try{
            origin = fs.readFileSync(this.storagePath);
            if(JSON.parse(origin.toString())[this.currentId![0]+this.currentId![1]]){
                return;
            }
        } catch (err){
            console.log(err);
        }

        let samples:any[] = [];
        console.log('https://codeforces.com/contest/'+this.currentId[0]+'/problem/'+this.currentId[1]);
        superagent.get('https://codeforces.com/contest/'+this.currentId[0]+'/problem/'+this.currentId[1]).end((err, res) => {
            if (err) {
                vscode.window.showErrorMessage(`访问失败 - ${err}`);
                return;
            } else {
                samples = getSample(res);
                console.log(samples);
                if(!fs.existsSync(this.storagePath)){
                    fs.mkdirSync(this.storagePath);
                }
                if(!fs.existsSync(this.storagePath)){
                    fs.writeFileSync(this.storagePath, '{}');
                }
                console.log('read');
                fs.readFile(this.storagePath, (err, data) => {
                    if(err){ return console.error(err);}
                    let content = JSON.parse(data.toString());
                    console.log(content);
                    content[this.currentId![0]+this.currentId![1]]=samples;
                    fs.writeFile(this.storagePath, JSON.stringify(content), (err) => {
                        if(err){ return console.error(err);}
                        console.log('Push successful');
                    });
                });
            }
        });
        let getSample = (res:superagent.Response) => {
            let inputs: string[] = [];
            let outputs: string[] = [];
            let samples: any[] = [];
            let $ = cheerio.load(res.text);
        
            $('div.input pre').each((idx, ele) => {
                inputs.push($(ele).text());
            });
            $('div.output pre').each((idx, ele) => {
                outputs.push($(ele).text());
            });

            // console.log(inputs);
            // console.log(outputs);
            // console.log(samples);

            inputs.forEach((value, index, array) => {
                samples.push({'input': value, 'output': outputs[index]});
            });
            return samples;
        };
    }
    public problemId():string {
        if(!this.currentId){ throw new Error('Can\'t find the corresponding problem.');}
        return this.currentId[0]+this.currentId[1];
    }

    private display(id?:string[], show:boolean = true){
        this.statusDisplay.command = 'extension.fetchSamples';
        this.currentId = id;
        if(!id){
            this.statusDisplay.text = 'Not specified';
        }
        else{
            this.statusDisplay.text = id[1]+' of '+id[0];
            // this.statusDisplay.command = '';
        }
        if(show) {this.statusDisplay.show();}
    }
}