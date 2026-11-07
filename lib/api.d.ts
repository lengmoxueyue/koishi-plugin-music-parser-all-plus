import type { AxiosInstance } from 'axios';
import type { ParsedMusic, PlatformConfig } from './types';
import type { SimpleLRUCache } from './cache';
import type { DebugLogger } from './utils';
export interface ApiClientOptions {
    http: AxiosInstance;
    config: any;
    dedupEnabled: boolean;
    cacheTTL: number;
    urlCache: SimpleLRUCache<ParsedMusic>;
    debug: DebugLogger;
}
export declare class ApiClient {
    private opts;
    private backupAggregateUrl;
    constructor(opts: ApiClientOptions);
    fetch(url: string, type: string, matchId: string, platformConf: PlatformConfig): Promise<ParsedMusic>;
}
