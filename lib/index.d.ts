import { Context, Schema } from 'koishi';
export declare const name = "music-parser-all";
export interface ProxySettings {
    enabled: boolean;
    protocol?: 'http' | 'https';
    host?: string;
    port?: number;
    auth?: {
        username?: string;
        password?: string;
    };
}
export interface Config {
    enable: boolean;
    botName: string;
    showWaitingTip: boolean;
    debug: boolean;
    platformEnabled: Record<string, boolean>;
    unifiedMessageFormat: string;
    showMusicText: boolean;
    showCoverImage: boolean;
    showMusicVoice: boolean;
    showMusicVoiceFile: boolean;
    maxConcurrent: number;
    timeout: number;
    videoSendTimeout: number;
    userAgent: string;
    proxy: ProxySettings;
    customHeaders: {
        name: string;
        value: string;
    }[];
    ignoreSendError: boolean;
    retryTimes: number;
    retryInterval: number;
    enableForward: boolean;
    enableDeduplication: boolean;
    deduplicationInterval: number;
    cacheTTL: number;
    primaryApiUrl: string;
    backupApiUrl: string;
    platformDedicatedFirst: Record<string, boolean>;
    customApis: any[];
    customPlatforms: any[];
    globalFieldMapping: string;
    waitingTipText: string;
    unsupportedPlatformText: string;
    invalidLinkText: string;
    parseErrorPrefix: string;
    parseErrorItemFormat: string;
}
export declare const Config: Schema<{
    enable?: boolean | null | undefined;
    botName?: string | null | undefined;
    showWaitingTip?: boolean | null | undefined;
    debug?: boolean | null | undefined;
    platformEnabled?: ({
        netease?: boolean | null | undefined;
        kuwo?: boolean | null | undefined;
        qqmusic?: boolean | null | undefined;
        qishui?: boolean | null | undefined;
    } & import("cosmokit").Dict) | null | undefined;
} & import("cosmokit").Dict & {
    unifiedMessageFormat?: string | null | undefined;
} & {
    showMusicText?: boolean | null | undefined;
    showCoverImage?: boolean | null | undefined;
    showMusicVoice?: boolean | null | undefined;
    showMusicVoiceFile?: boolean | null | undefined;
} & {
    maxConcurrent?: number | null | undefined;
} & {
    timeout?: number | null | undefined;
    videoSendTimeout?: number | null | undefined;
    userAgent?: string | null | undefined;
    proxy?: ({
        enabled?: boolean | null | undefined;
        protocol?: "http" | "https" | null | undefined;
        host?: string | null | undefined;
        port?: number | null | undefined;
        auth?: ({
            username?: string | null | undefined;
            password?: string | null | undefined;
        } & import("cosmokit").Dict) | null | undefined;
    } & import("cosmokit").Dict) | null | undefined;
    customHeaders?: ({
        name?: string | null | undefined;
        value?: string | null | undefined;
    } & import("cosmokit").Dict)[] | null | undefined;
} & {
    ignoreSendError?: boolean | null | undefined;
    retryTimes?: number | null | undefined;
    retryInterval?: number | null | undefined;
    enableForward?: boolean | null | undefined;
} & {
    enableDeduplication?: boolean | null | undefined;
    deduplicationInterval?: number | null | undefined;
    cacheTTL?: number | null | undefined;
} & {
    primaryApiUrl?: string | null | undefined;
    backupApiUrl?: string | null | undefined;
    platformDedicatedFirst?: ({
        netease?: boolean | null | undefined;
        kuwo?: boolean | null | undefined;
        qqmusic?: boolean | null | undefined;
        qishui?: boolean | null | undefined;
    } & import("cosmokit").Dict) | null | undefined;
    customApis?: ({
        platform?: "netease" | "kuwo" | "qqmusic" | "qishui" | null | undefined;
        apiUrl?: string | null | undefined;
        apiKey?: string | null | undefined;
        authHeaderType?: "Bearer" | "X-API-Key" | "Custom" | null | undefined;
        customHeaderName?: string | null | undefined;
        fieldMapping?: string | null | undefined;
    } & import("cosmokit").Dict)[] | null | undefined;
    customPlatforms?: ({
        name?: string | null | undefined;
        exampleUrl?: string | null | undefined;
        keywords?: string | null | undefined;
        apiUrl?: string | null | undefined;
        apiKey?: string | null | undefined;
        authHeaderType?: "Bearer" | "X-API-Key" | "Custom" | null | undefined;
        customHeaderName?: string | null | undefined;
        fieldMapping?: string | null | undefined;
        proxy?: ({
            enabled?: boolean | null | undefined;
            protocol?: "http" | "https" | null | undefined;
            host?: string | null | undefined;
            port?: number | null | undefined;
            auth?: ({
                username?: string | null | undefined;
                password?: string | null | undefined;
            } & import("cosmokit").Dict) | null | undefined;
        } & import("cosmokit").Dict) | null | undefined;
    } & import("cosmokit").Dict)[] | null | undefined;
    globalFieldMapping?: string | null | undefined;
} & {
    waitingTipText?: string | null | undefined;
    unsupportedPlatformText?: string | null | undefined;
    invalidLinkText?: string | null | undefined;
    parseErrorPrefix?: string | null | undefined;
    parseErrorItemFormat?: string | null | undefined;
}, {
    enable: boolean;
    botName: string;
    showWaitingTip: boolean;
    debug: boolean;
    platformEnabled: Schemastery.ObjectT<{
        netease: Schema<boolean, boolean>;
        kuwo: Schema<boolean, boolean>;
        qqmusic: Schema<boolean, boolean>;
        qishui: Schema<boolean, boolean>;
    }>;
} & import("cosmokit").Dict & {
    unifiedMessageFormat: string;
} & {
    showMusicText: boolean;
    showCoverImage: boolean;
    showMusicVoice: boolean;
    showMusicVoiceFile: boolean;
} & {
    maxConcurrent: number;
} & {
    timeout: number;
    videoSendTimeout: number;
    userAgent: string;
    proxy: Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        protocol: Schema<"http" | "https", "http" | "https">;
        host: Schema<string, string>;
        port: Schema<number, number>;
        auth: Schema<Schemastery.ObjectS<{
            username: Schema<string, string>;
            password: Schema<string, string>;
        }>, Schemastery.ObjectT<{
            username: Schema<string, string>;
            password: Schema<string, string>;
        }>>;
    }>;
    customHeaders: Schemastery.ObjectT<{
        name: Schema<string, string>;
        value: Schema<string, string>;
    }>[];
} & {
    ignoreSendError: boolean;
    retryTimes: number;
    retryInterval: number;
    enableForward: boolean;
} & {
    enableDeduplication: boolean;
    deduplicationInterval: number;
    cacheTTL: number;
} & {
    primaryApiUrl: string;
    backupApiUrl: string;
    platformDedicatedFirst: Schemastery.ObjectT<{
        netease: Schema<boolean, boolean>;
        kuwo: Schema<boolean, boolean>;
        qqmusic: Schema<boolean, boolean>;
        qishui: Schema<boolean, boolean>;
    }>;
    customApis: Schemastery.ObjectT<{
        platform: Schema<"netease" | "kuwo" | "qqmusic" | "qishui", "netease" | "kuwo" | "qqmusic" | "qishui">;
        apiUrl: Schema<string, string>;
        apiKey: Schema<string, string>;
        authHeaderType: Schema<"Bearer" | "X-API-Key" | "Custom", "Bearer" | "X-API-Key" | "Custom">;
        customHeaderName: Schema<string, string>;
        fieldMapping: Schema<string, string>;
    }>[];
    customPlatforms: Schemastery.ObjectT<{
        name: Schema<string, string>;
        exampleUrl: Schema<string, string>;
        keywords: Schema<string, string>;
        apiUrl: Schema<string, string>;
        apiKey: Schema<string, string>;
        authHeaderType: Schema<"Bearer" | "X-API-Key" | "Custom", "Bearer" | "X-API-Key" | "Custom">;
        customHeaderName: Schema<string, string>;
        fieldMapping: Schema<string, string>;
        proxy: Schema<Schemastery.ObjectS<{
            enabled: Schema<boolean, boolean>;
            protocol: Schema<"http" | "https", "http" | "https">;
            host: Schema<string, string>;
            port: Schema<number, number>;
            auth: Schema<Schemastery.ObjectS<{
                username: Schema<string, string>;
                password: Schema<string, string>;
            }>, Schemastery.ObjectT<{
                username: Schema<string, string>;
                password: Schema<string, string>;
            }>>;
        }>, Schemastery.ObjectT<{
            enabled: Schema<boolean, boolean>;
            protocol: Schema<"http" | "https", "http" | "https">;
            host: Schema<string, string>;
            port: Schema<number, number>;
            auth: Schema<Schemastery.ObjectS<{
                username: Schema<string, string>;
                password: Schema<string, string>;
            }>, Schemastery.ObjectT<{
                username: Schema<string, string>;
                password: Schema<string, string>;
            }>>;
        }>>;
    }>[];
    globalFieldMapping: string;
} & {
    waitingTipText: string;
    unsupportedPlatformText: string;
    invalidLinkText: string;
    parseErrorPrefix: string;
    parseErrorItemFormat: string;
}>;
export declare function apply(ctx: Context, config: Config): void;
