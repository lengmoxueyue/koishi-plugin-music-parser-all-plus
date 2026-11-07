"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrencyLimiter = exports.SimpleLRUCache = void 0;
class SimpleLRUCache {
    constructor(max, ttlMs) {
        this.max = max;
        this.ttlMs = ttlMs;
        this.map = new Map();
    }
    get(key) {
        const entry = this.map.get(key);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expireAt) {
            this.map.delete(key);
            return undefined;
        }
        return entry.value;
    }
    set(key, value) {
        this.map.delete(key);
        while (this.map.size >= this.max) {
            const oldest = this.map.keys().next().value;
            if (oldest === undefined)
                break;
            this.map.delete(oldest);
        }
        this.map.set(key, { value, expireAt: Date.now() + this.ttlMs });
    }
    clear() {
        this.map.clear();
    }
}
exports.SimpleLRUCache = SimpleLRUCache;
class ConcurrencyLimiter {
    constructor(max) {
        this.max = max;
        this.running = 0;
        this.queue = [];
    }
    async acquire() {
        if (this.running < this.max) {
            this.running++;
            return;
        }
        return new Promise(resolve => {
            this.queue.push(() => {
                this.running++;
                resolve();
            });
        });
    }
    release() {
        this.running = Math.max(0, this.running - 1);
        const next = this.queue.shift();
        if (next)
            next();
    }
}
exports.ConcurrencyLimiter = ConcurrencyLimiter;
