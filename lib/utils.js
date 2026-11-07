"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.DebugLogger = void 0;
exports.cleanUrl = cleanUrl;
exports.parseFieldMapping = parseFieldMapping;
exports.getNestedValue = getNestedValue;
exports.getErrorMessage = getErrorMessage;
exports.buildAuthHeaders = buildAuthHeaders;
exports.generateFormattedText = generateFormattedText;
exports.buildForwardNode = buildForwardNode;
const koishi_1 = require("koishi");
class DebugLogger {
    constructor(logger, enabled) {
        this.logger = logger;
        this.enabled = enabled;
    }
    setEnabled(value) {
        this.enabled = value;
    }
    log(level, ...args) {
        if (!this.enabled)
            return;
        this.logger.info(`[${new Date().toISOString()}] [${level}] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);
    }
}
exports.DebugLogger = DebugLogger;
function cleanUrl(url) {
    try {
        url = url.replace(/&amp;/g, '&');
        const urlObj = new URL(url);
        if (urlObj.protocol === 'http:')
            urlObj.protocol = 'https:';
        if (urlObj.hostname.includes('music.163.com') || urlObj.hostname.includes('163cn.tv')) {
            for (const p of ['userid', 'app_version', 'hdsuffix'])
                urlObj.searchParams.delete(p);
            return urlObj.origin + urlObj.pathname + (urlObj.search ? '?' + urlObj.search : '');
        }
        return urlObj.toString();
    }
    catch {
        return url.replace(/&amp;/g, '&').replace(/\?.*/, '');
    }
}
function parseFieldMapping(mappingStr) {
    if (!mappingStr)
        return undefined;
    const trimmed = mappingStr.trim();
    if (!trimmed || trimmed === '{}')
        return undefined;
    try {
        const obj = JSON.parse(trimmed);
        if (typeof obj === 'object' && !Array.isArray(obj))
            return obj;
        return undefined;
    }
    catch {
        return undefined;
    }
}
function getNestedValue(obj, path) {
    if (!path)
        return obj;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === null || current === undefined)
            return undefined;
        current = current[key];
    }
    return current;
}
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (error && typeof error === 'object' && 'message' in error)
        return String(error.message);
    return String(error);
}
function buildAuthHeaders(apiKey, authHeaderType, customHeaderName) {
    if (!apiKey)
        return {};
    switch (authHeaderType) {
        case 'Bearer': return { Authorization: `Bearer ${apiKey}` };
        case 'X-API-Key': return { 'X-API-Key': apiKey };
        case 'Custom': return customHeaderName ? { [customHeaderName]: apiKey } : {};
        default: return {};
    }
}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
function generateFormattedText(p, format) {
    const vars = {
        name: p.name,
        artist: p.artist,
        album: p.album,
        cover: p.cover,
        music_url: p.musicUrl,
        level: p.level || '',
        size: p.size || '',
    };
    const resultLines = [];
    for (const line of format.split('\n')) {
        let hasVar = false;
        let allEmpty = true;
        const newLine = line.replace(/\$\{([^}]+)\}/g, (match, raw) => {
            hasVar = true;
            const val = vars[raw];
            if (val !== undefined && val !== '' && val !== '0')
                allEmpty = false;
            return val !== undefined ? val : match;
        });
        if (hasVar && allEmpty)
            continue;
        resultLines.push(newLine);
    }
    return resultLines.join('\n').trim();
}
function buildForwardNode(session, content, botName) {
    let messageContent;
    if (Array.isArray(content)) {
        messageContent = content;
    }
    else if (content && typeof content === 'object' && content.type) {
        messageContent = [content];
    }
    else {
        messageContent = [koishi_1.h.text(String(content))];
    }
    return (0, koishi_1.h)('node', {
        user: { nickname: botName.substring(0, 15), user_id: session.selfId },
    }, messageContent);
}
