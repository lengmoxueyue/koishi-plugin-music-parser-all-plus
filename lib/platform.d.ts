import type { CustomPlatformConfig, PlatformConfig } from './types';
export declare function normalizeCustomPlatforms(list: any[]): CustomPlatformConfig[];
export declare class PlatformResolver {
    private config;
    private customPlatforms;
    constructor(config: any, customPlatforms: CustomPlatformConfig[]);
    resolve(type: string): PlatformConfig;
}
