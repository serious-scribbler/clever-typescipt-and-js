/**
 * Lock for asynchronous operations, below is an example as to why that is needed
 * Based on: https://stackoverflow.com/a/76370494
 * By Lim Meng Kiat (Lim Meng Kiat)
 * CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
 * 
 * Modified by Phil Niehus (serious-scribbler)
 */
class AsyncLock {
    private _lock: Promise<void> = Promise.resolve();
    private _resolve = () => { };

    aquire(): void {
        this._lock = new Promise((resolve) => {
            this._resolve = resolve;
        });
    }

    release(): void {
        this._resolve();
    }

    async waitFor(): Promise<void> {
        return this._lock;
    }
}


// EXAMPLE STARTS HERE


function Sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

class Thing {
    public value?: number = undefined;
}

const lock = new AsyncLock();
const unsafeWithoutLock = new Thing();

async function secured(name: number) {
    console.log(name, " waiting...")
    await lock.waitFor(); // uncomment this line to see how the output changes
    console.log("before ", name, unsafeWithoutLock);
    lock.aquire();
    if (unsafeWithoutLock.value === undefined) {
        // Without the lock, both calls to the method will write concurrently
        console.log("writing ", name, " ", Date.now());
        await Sleep(5000);
        unsafeWithoutLock.value = new Date().getMilliseconds();
    } else {
        // With the lock, the second call will just multiply the value by 2
        unsafeWithoutLock.value *= 2;
    }
    lock.release();
    console.log("after ", name, unsafeWithoutLock.value);
}

secured(1).then();

// The timout is needed to prevent js to start the execution of the promises at the same time
// I'm currently trying to come up with a solution that will work regardless using MicroTasks

setTimeout(() => {
    secured(2).then();
}, 1);