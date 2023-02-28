const delayInMs = 30000; //30 seconds

export class PromiseQueues {

    private queues:Map<string,PromiseQueue> = new Map();
    enqueue(key:string):Promise<void> {
        var q = this.queues.get(key);
        if (q == null){
            const callback = ()=> {
                this.queues.delete(key);
            }
            q = new PromiseQueue(callback);
            this.queues.set(key, q);
        }
        return q.enqueue();
    }
}

export class PromiseQueue {
  private queue: (() => void)[] = [];
  private working = false;
  private resolveOnComplete: () => void;

  constructor(callback: () => void) {
    this.resolveOnComplete = callback;
  }

  enqueue(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (this.working){
            this.queue.push(resolve);
            return;
        }
        resolve();
        this.working = true;
        setTimeout(()=> {
            this.doNext();
        }, delayInMs);
    });
  }

  doNext(){
    const next = this.queue.shift();
    if (!next){
        this.working = false;
        this.resolveOnComplete();
        return;
    }
    this.working = true;
    setTimeout(()=> {
        next();
        this.doNext();
    }, delayInMs);
  }
}