"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const utils_1 = require("./utils");
const parser_1 = require("./parser");
class ApiClient {
    constructor(opts) {
        this.opts = opts;
        this.backupAggregateUrl = opts.config.backupApiUrl || 'https://api.bugpk.com/api/music';
    }
    async fetch(url, type, matchId, platformConf) {
        const { config, http, dedupEnabled, cacheTTL, urlCache, debug } = this.opts;
        const cacheKey = url;
        if (dedupEnabled) {
            const cached = urlCache.get(cacheKey);
            if (cached)
                return cached;
        }
        if (type === 'netease' || type === 'qqmusic' || type === 'kugou') {
            const parsed = await require('./meting').resolve(type, url, matchId);
            if (dedupEnabled)
                urlCache.set(cacheKey, parsed);
            return parsed;
        }        const { apiUrl, dedicatedFirst, apiKey, authHeaderType, customHeaderName, customProxy, fieldMapping } = platformConf;
        const backupApis = [];
        if (type === 'netease' || type === 'qqmusic') {
            backupApis.push({ url: this.backupAggregateUrl, label: '聚合备用API', fieldMapping });
        }
        const apiList = [];
        if (apiUrl) {
            apiList.push({
                url: apiUrl,
                label: dedicatedFirst ? `专属API(${type})` : `默认API(${type})`,
                apiKey,
                authHeaderType,
                customHeaderName,
                fieldMapping,
            });
        }
        apiList.push(...backupApis);
        let lastError = null;
        for (const api of apiList) {
            for (let attempt = 0; attempt <= config.retryTimes; attempt++) {
                try {
                    const headers = {
                        'User-Agent': config.userAgent,
                        'Referer': 'https://www.baidu.com/',
                    };
                    if (api.apiKey) {
                        Object.assign(headers, (0, utils_1.buildAuthHeaders)(api.apiKey, api.authHeaderType || 'Bearer', api.customHeaderName || 'X-API-Key'));
                    }
                    const isAggregate = api.url === this.backupAggregateUrl;
                    const params = isAggregate
                        ? { id: matchId, media: type === 'netease' ? 'netease' : 'tencent', type: 'song' }
                        : { url: (0, utils_1.cleanUrl)(url) };
                    if (!isAggregate && type === 'netease' && api.url.includes('163_music')) {
                        params.type = 'json';
                    }
                    const proxyToUse = customProxy && customProxy.enabled ? customProxy : (config.proxy?.enabled ? config.proxy : undefined);
                    const requestConfig = {
                        params,
                        timeout: config.timeout,
                        headers,
                        proxy: proxyToUse && proxyToUse.host ? {
                            protocol: proxyToUse.protocol || 'http',
                            host: proxyToUse.host,
                            port: proxyToUse.port || 7890,
                            auth: proxyToUse.auth?.username ? { username: proxyToUse.auth.username, password: proxyToUse.auth.password || '' } : undefined,
                        } : undefined,
                    };
                    const res = await http.get(api.url, requestConfig);
                    const rawData = res.data;
                    if (rawData && (rawData.code === 200 || rawData.code === 0 || (isAggregate && rawData.url))) {
                        const parsed = (0, parser_1.parseApiResponse)(rawData, type, api.fieldMapping);
                        if (dedupEnabled)
                            urlCache.set(cacheKey, parsed);
                        return parsed;
                    }
                    throw new Error(rawData?.msg || `API返回错误码: ${rawData?.code}`);
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    debug.log('ERROR', `${api.label} attempt ${attempt + 1} failed: ${lastError.message}`);
                    if (attempt < config.retryTimes) {
                        await (0, utils_1.delay)(config.retryInterval);
                        continue;
                    }
                    break;
                }
            }
            debug.log('WARN', `${api.label} all retries failed`);
        }
        throw lastError || new Error('所有API请求全部失败');
    }
}
exports.ApiClient = ApiClient;
