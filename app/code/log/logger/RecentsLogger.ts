
import { nowHHMMSS } from "~/code/agnostic/timeUtils";
import ILogger from "./ILogger";
import { sprintf } from 'sprintf-js';

export default class RecentsLogger implements ILogger {
    
    public recentLogs:string[] = [];
    public recentErrs:string[] = [];
    id:number = Math.floor(Math.random()*1000);
    
    constructor() {
    }

    debug(message?: string, ...optionalParams: any[]): void {
        this.addLog(false, message, ...optionalParams);
        console.debug(message, ...optionalParams);        
    }

    info(message?: string, ...optionalParams: any[]): void {
        console.log("recents logger doing stuff...");
        this.addLog(false, message, ...optionalParams);
        console.info(message, ...optionalParams);
    }

    warn(message?: string, ...optionalParams: any[]): void {
        this.addLog(false, message, ...optionalParams);
        console.warn(message, ...optionalParams);
    }

    error(message?: string, ...optionalParams: any[]): void {
        this.addLog(true, message, ...optionalParams);
        console.error(message, ...optionalParams);
    }

    getRecentLogs() {
        console.log(`rl ${this.id}: get recent logs copy from... ${this.recentLogs.length}`);
        return [...this.recentLogs];
    }

    private addLog(isErr:boolean,  message?: string, ...optionalParams: any[]){
        console.log("add log...");
        
        var msg = nowHHMMSS() + ": " + sprintf(message ?? "", ...optionalParams);
        this.recentLogs.push(msg);
        if (this.recentLogs.length > 200){
            keepLastElements(this.recentLogs, 100);
        }
        
        if (isErr){
            this.recentErrs.push(msg);
            if (this.recentErrs.length > 200){
                keepLastElements(this.recentErrs, 100);
            }
        }
        console.log(`rl ${this.id}: now it's...  ${this.recentLogs.length}`);
    }
}

function keepLastElements(arr:any[], keepLast:number ){
    const elementsToRemove = arr.length - keepLast;
    arr.splice(0, elementsToRemove);
}
