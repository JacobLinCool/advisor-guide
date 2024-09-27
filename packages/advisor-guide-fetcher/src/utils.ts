export class ConcurrencyThrottle {
    private queue: (() => Promise<void>)[] = [];
    private activeCount: number = 0;

    constructor(private maxConcurrency: number) {}

    async run<T>(fn: () => Promise<T>): Promise<T> {
        if (this.activeCount < this.maxConcurrency) {
            return this.runTask(fn);
        } else {
            // If the maximum concurrency is reached, add the task to the queue
            return new Promise<T>((resolve, reject) => {
                this.queue.push(() => this.runTask(fn).then(resolve).catch(reject));
            });
        }
    }

    private async runTask<T>(fn: () => Promise<T>): Promise<T> {
        this.activeCount++;
        try {
            const result = await fn();
            return result;
        } finally {
            this.activeCount--;
            this.next(); // Trigger next task in the queue if any
        }
    }

    private next(): void {
        if (this.queue.length > 0 && this.activeCount < this.maxConcurrency) {
            const task = this.queue.shift(); // Take the first task from the queue
            if (task) {
                task(); // Execute the task
            }
        }
    }
}
