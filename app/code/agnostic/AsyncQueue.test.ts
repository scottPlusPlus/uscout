import { nowUnixTimestamp } from "../timeUtils";
import { AsyncQueue } from "./AsyncQueue";
import { createPromiseWithResolver } from "./PromiseUtils";
import { wait } from "./coreUtils";

test("async queue works", async () => {

    const output = new Array<number>();
    const queue = new AsyncQueue();

    const wait2sAndLog = async ()=> {
        console.log("starting wait 2 and log");
        await wait(2000);
        console.log("done waiting...");
        const now = nowUnixTimestamp();
        output.push(now);
    }

    const {promise, resolver} = createPromiseWithResolver();
    const handler = ()=> {
        console.log("handler triggered");
        output.push(-1);
        resolver();
    }

    queue.onEmpty.registerHandler(handler);
    queue.enqueue(wait2sAndLog);
    queue.enqueue(wait2sAndLog);

    await promise;

    console.log("past the promise");
    console.log(JSON.stringify(output));

    expect(output.length).toEqual(3);
    expect(output[1]-1).toBeGreaterThan(output[0]);
    expect(output[2]).equal(-1);
}, 6000);