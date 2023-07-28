import { Signal } from "./Signal";

type AsyncFunc = ()=>Promise<void>;

export class AsyncQueue {

    private queue: Array<AsyncFunc> = [];
    private working = false;
    onEmpty = new Signal<void>();

    enqueue(func:AsyncFunc):void {
        this.queue.push(func);
        if (!this.working){
            this.doNext();
        }
    }

    doNext(){
        const next = this.queue.shift();
        if (!next){
            this.working = false;
            this.onEmpty.trigger();
            return;
        }
        this.working = true;
        const p = next();
        p.then(()=> {
            this.doNext();
        });
      }
}