import type { ParsedMusic, LinkMatch, LinkRule } from './types';
export declare const BUILTIN_LINK_RULES: LinkRule[];
export declare function buildCustomLinkRules(customPlatforms: any[]): LinkRule[];
export declare function linkTypeParser(content: string, customRules: LinkRule[]): LinkMatch[];
export declare function extractAllUrlsFromMessage(session: any, customRules: LinkRule[]): LinkMatch[];
export declare function parseApiResponse(raw: any, type: string, fieldMapping?: Record<string, string>): ParsedMusic;
