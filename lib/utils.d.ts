import { Logger } from 'koishi';
import type { ParsedMusic } from './types';
export declare class DebugLogger {
    private logger;
    private enabled;
    constructor(logger: Logger, enabled: boolean);
    setEnabled(value: boolean): void;
    log(level: string, ...args: any[]): void;
}
export declare function cleanUrl(url: string): string;
export declare function parseFieldMapping(mappingStr: string): Record<string, string> | undefined;
export declare function getNestedValue(obj: any, path: string): any;
export declare function getErrorMessage(error: unknown): string;
export declare function buildAuthHeaders(apiKey: string, authHeaderType: string, customHeaderName: string): Record<string, string>;
export declare const delay: (ms: number) => Promise<void>;
export declare function generateFormattedText(p: ParsedMusic, format: string): string;
export declare function buildForwardNode(session: any, content: any, botName: string): any;
