"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformResolver = void 0;
exports.normalizeCustomPlatforms = normalizeCustomPlatforms;
const utils_1 = require("./utils");
const DEFAULT_DEDICATED_APIS = {
    netease: 'https://api.bugpk.com/api/163_music',
    kuwo: 'https://api.bugpk.com/api/kuwo',
    qqmusic: 'https://api.bugpk.com/api/qqmusic',
    qishui: 'https://api.bugpk.com/api/qsmusic',
};
function normalizeCustomPlatforms(list) {
    if (!Array.isArray(list))
        return [];
    return list.map(p => ({
        name: p.name,
        apiUrl: p.apiUrl,
        apiKey: p.apiKey || '',
        authHeaderType: p.authHeaderType || 'Bearer',
        customHeaderName: p.customHeaderName || 'X-API-Key',
        fieldMapping: (0, utils_1.parseFieldMapping)(p.fieldMapping),
        proxy: p.proxy || null,
    }));
}
class PlatformResolver {
    constructor(config, customPlatforms) {
        this.config = config;
        this.customPlatforms = customPlatforms;
    }
    resolve(type) {
        if (type.startsWith('custom_')) {
            const name = type.slice(7);
            const custom = this.customPlatforms.find(p => p.name === name);
            if (custom) {
                return {
                    apiUrl: custom.apiUrl,
                    dedicatedFirst: true,
                    apiKey: custom.apiKey || '',
                    authHeaderType: custom.authHeaderType,
                    customHeaderName: custom.customHeaderName,
                    fieldMapping: custom.fieldMapping,
                    customProxy: custom.proxy,
                };
            }
            return { apiUrl: null, dedicatedFirst: false, apiKey: '', authHeaderType: 'Bearer', customHeaderName: 'X-API-Key' };
        }
        const custom = this.config.customApis?.find((item) => item.platform === type);
        let apiUrl = DEFAULT_DEDICATED_APIS[type] || null;
        let apiKey = '';
        let authHeaderType = 'Bearer';
        let customHeaderName = 'X-API-Key';
        let fieldMapping;
        if (custom && custom.apiUrl) {
            apiUrl = custom.apiUrl;
            apiKey = custom.apiKey || '';
            authHeaderType = custom.authHeaderType || 'Bearer';
            customHeaderName = custom.customHeaderName || 'X-API-Key';
            fieldMapping = (0, utils_1.parseFieldMapping)(custom.fieldMapping);
        }
        const dedicatedFirst = this.config.platformDedicatedFirst?.[type] ?? false;
        if (!fieldMapping)
            fieldMapping = (0, utils_1.parseFieldMapping)(this.config.globalFieldMapping);
        return { apiUrl, dedicatedFirst, apiKey, authHeaderType, customHeaderName, fieldMapping };
    }
}
exports.PlatformResolver = PlatformResolver;
