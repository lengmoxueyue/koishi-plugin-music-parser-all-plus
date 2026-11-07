export declare class SimpleLRUCache<V> {
    private max;
    private ttlMs;
    private map;
    constructor(max: number, ttlMs: number);
    get(key: string): V | undefined;
    set(key: string, value: V): void;
    clear(): void;
}
export declare class ConcurrencyLimiter {
    private max;
    private running;
    private queue;
    constructor(max: number);
    acquire(): Promise<void>;
    release(): void;
}
