type Handler<T> = (arg0:T)=>void;

export class Signal<T> {
    private handlers: Handler<T>[] = [];
  
    // Register a handler
    public registerHandler(handler:Handler<T>): void {
      this.handlers.push(handler);
    }
  
    // Trigger the event and execute all registered handlers
    public trigger(arg:T): void {
      for (const handler of this.handlers) {
        handler(arg);
      }
    }
  }
