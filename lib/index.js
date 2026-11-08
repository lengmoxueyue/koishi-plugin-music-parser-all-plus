"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.name = void 0;
exports.apply = apply;
const koishi_1 = require("koishi");
const axios_1 = __importDefault(require("axios"));
const cache_1 = require("./cache");
const utils_1 = require("./utils");
const parser_1 = require("./parser");
const platform_1 = require("./platform");
const api_1 = require("./api");
exports.name = 'music-parser-all';
exports.usage = [
    '<p><b>自动解析音乐链接</b>：网易云、QQ 音乐（含手机短链、分享卡片）、酷狗（分享链接）。</p>',
    '<p><b>发送流程：</b></p>',
    '<ol>',
    '<li>发送文字 + 封面（格式见「消息格式」）</li>',
    '<li>发送语音（QQ 语音最长 60 秒，长歌会被截断）</li>',
    '<li>追问「要完整音频文件吗？15 秒内回复「是」获取」——回复 是/要/好/需要 即发送完整 mp3 文件</li>',
    '</ol>',
    '<p><b>命令：</b></p>',
    '<ul>',
    '<li><code>music-parse &lt;链接&gt;</code>：手动解析指定链接</li>',
    '<li><code>music-file</code>：发送当前频道上一首歌的完整文件</li>',
    '<li><code>music-file &lt;链接&gt;</code>：解析指定链接并直接发文件</li>',
    '</ul>',
    '<p>各平台可在「各平台解析开关」里单独启停。</p>',
].join('\n');
exports.Config = koishi_1.Schema.intersect([
    koishi_1.Schema.object({
        enable: koishi_1.Schema.boolean().default(true).description('是否启用音乐解析插件'),
        botName: koishi_1.Schema.string().default('音乐解析机器人').description('合并转发中显示的昵称'),
        showWaitingTip: koishi_1.Schema.boolean().default(true).description('解析时显示等待提示'),
        debug: koishi_1.Schema.boolean().default(false).description('开启调试日志'),
        platformEnabled: koishi_1.Schema.object({
            netease: koishi_1.Schema.boolean().default(true).description('网易云音乐'),
            kuwo: koishi_1.Schema.boolean().default(true).description('酷我音乐'),
            qqmusic: koishi_1.Schema.boolean().default(true).description('QQ音乐'),
            qishui: koishi_1.Schema.boolean().default(true).description('汽水音乐'),
        }).description('各平台解析开关'),
    }).description('基本设置'),
    koishi_1.Schema.object({
        unifiedMessageFormat: koishi_1.Schema.string().role('textarea').default('歌名：${name}\n歌手：${artist}\n专辑：${album}\n音质：${level}\n大小：${size}').description('文字格式，支持变量，空行自动隐藏'),
    }).description('消息格式'),
    koishi_1.Schema.object({
        showMusicText: koishi_1.Schema.boolean().default(true).description('发送文字内容'),
        showCoverImage: koishi_1.Schema.boolean().default(true).description('发送封面图片'),
        showMusicVoice: koishi_1.Schema.boolean().default(false).description('音乐链接以语音形式发送'),
        showMusicVoiceFile: koishi_1.Schema.boolean().default(true).description('音乐链接是否以语音形式发送（关闭则只发送链接）'),
        sendFullFile: koishi_1.Schema.boolean().default(false).description('解析到完整音频时，在保留语音的同时追发完整 mp3 文件（不追问）'),
    }).description('媒体发送'),
    koishi_1.Schema.object({
        maxConcurrent: koishi_1.Schema.number().min(1).step(1).default(3).description('解析最大并发数'),
    }).description('性能'),
    koishi_1.Schema.object({
        timeout: koishi_1.Schema.number().min(0).step(1).default(180000).description('API 请求超时 (ms)'),
        videoSendTimeout: koishi_1.Schema.number().min(0).step(1).default(180000).description('消息发送超时 (ms)'),
        userAgent: koishi_1.Schema.string().default('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36').description('User-Agent'),
        proxy: koishi_1.Schema.object({
            enabled: koishi_1.Schema.boolean().default(false).description('启用代理'),
            protocol: koishi_1.Schema.union([
                koishi_1.Schema.const('http').description('HTTP'),
                koishi_1.Schema.const('https').description('HTTPS'),
            ]).default('http').description('协议'),
            host: koishi_1.Schema.string().default('127.0.0.1').description('地址'),
            port: koishi_1.Schema.number().default(7890).description('端口'),
            auth: koishi_1.Schema.object({
                username: koishi_1.Schema.string().default('').description('用户名'),
                password: koishi_1.Schema.string().default('').description('密码'),
            }).description('认证'),
        }).description('HTTP/HTTPS 代理'),
        customHeaders: koishi_1.Schema.array(koishi_1.Schema.object({
            name: koishi_1.Schema.string().required().description('头名称'),
            value: koishi_1.Schema.string().required().description('头值'),
        })).default([]).description('自定义请求头'),
    }).description('网络与请求'),
    koishi_1.Schema.object({
        ignoreSendError: koishi_1.Schema.boolean().default(true).description('忽略发送失败'),
        retryTimes: koishi_1.Schema.number().min(0).step(1).default(3).description('重试次数'),
        retryInterval: koishi_1.Schema.number().min(0).step(1).default(1000).description('重试间隔 (ms)'),
        enableForward: koishi_1.Schema.boolean().default(false).description('合并转发（OneBot/Satori）'),
    }).description('发送与重试'),
    koishi_1.Schema.object({
        enableDeduplication: koishi_1.Schema.boolean().default(true).description('启用重复解析检测与提示'),
        deduplicationInterval: koishi_1.Schema.number().min(0).step(1).default(180).description('去重间隔 (s)'),
        cacheTTL: koishi_1.Schema.number().min(0).step(1).default(600).description('缓存时间 (s)'),
    }).description('缓存与去重'),
    koishi_1.Schema.object({
        primaryApiUrl: koishi_1.Schema.string().default('https://api.bugpk.com/api/163_music').hidden(),
        backupApiUrl: koishi_1.Schema.string().default('https://api.bugpk.com/api/music').hidden(),
        platformDedicatedFirst: koishi_1.Schema.object({
            netease: koishi_1.Schema.boolean().default(false).description('网易云音乐'),
            kuwo: koishi_1.Schema.boolean().default(false).description('酷我音乐'),
            qqmusic: koishi_1.Schema.boolean().default(false).description('QQ音乐'),
            qishui: koishi_1.Schema.boolean().default(false).description('汽水音乐'),
        }).description('优先使用专属 API'),
        customApis: koishi_1.Schema.array(koishi_1.Schema.object({
            platform: koishi_1.Schema.union([
                koishi_1.Schema.const('netease').description('网易云音乐'),
                koishi_1.Schema.const('kuwo').description('酷我音乐'),
                koishi_1.Schema.const('qqmusic').description('QQ音乐'),
                koishi_1.Schema.const('qishui').description('汽水音乐'),
            ]).description('平台'),
            apiUrl: koishi_1.Schema.string().description('API 地址'),
            apiKey: koishi_1.Schema.string().description('API Key').default(''),
            authHeaderType: koishi_1.Schema.union([
                koishi_1.Schema.const('Bearer').description('Bearer'),
                koishi_1.Schema.const('X-API-Key').description('X-API-Key'),
                koishi_1.Schema.const('Custom').description('自定义'),
            ]).default('Bearer').description('认证头类型'),
            customHeaderName: koishi_1.Schema.string().default('X-API-Key').description('自定义头名称'),
            fieldMapping: koishi_1.Schema.string().role('textarea').default('{}').description('字段映射 JSON'),
        })).default([]).description('覆盖内置平台 API'),
        customPlatforms: koishi_1.Schema.array(koishi_1.Schema.object({
            name: koishi_1.Schema.string().required().description('平台名称'),
            exampleUrl: koishi_1.Schema.string().description('示例链接'),
            keywords: koishi_1.Schema.string().required().description('关键词（逗号分隔）'),
            apiUrl: koishi_1.Schema.string().required().description('解析 API'),
            apiKey: koishi_1.Schema.string().default('').description('API Key'),
            authHeaderType: koishi_1.Schema.union([
                koishi_1.Schema.const('Bearer').description('Bearer'),
                koishi_1.Schema.const('X-API-Key').description('X-API-Key'),
                koishi_1.Schema.const('Custom').description('自定义'),
            ]).default('Bearer').description('认证头类型'),
            customHeaderName: koishi_1.Schema.string().default('X-API-Key').description('自定义头名称'),
            fieldMapping: koishi_1.Schema.string().role('textarea').default('{}').description('字段映射 JSON'),
            proxy: koishi_1.Schema.object({
                enabled: koishi_1.Schema.boolean().default(false).description('启用独立代理'),
                protocol: koishi_1.Schema.union([
                    koishi_1.Schema.const('http').description('HTTP'),
                    koishi_1.Schema.const('https').description('HTTPS'),
                ]).default('http').description('协议'),
                host: koishi_1.Schema.string().default('127.0.0.1').description('地址'),
                port: koishi_1.Schema.number().default(7890).description('端口'),
                auth: koishi_1.Schema.object({
                    username: koishi_1.Schema.string().default('').description('用户名'),
                    password: koishi_1.Schema.string().default('').description('密码'),
                }).description('认证'),
            }).description('独立代理（覆盖全局代理）'),
        })).default([]).description('自定义新平台'),
        globalFieldMapping: koishi_1.Schema.string().role('textarea').default('{\n' +
            '  "name": "data.name",\n' +
            '  "artist": "data.ar_name",\n' +
            '  "album": "data.al_name",\n' +
            '  "cover": "data.pic",\n' +
            '  "musicUrl": "data.url",\n' +
            '  "level": "data.level",\n' +
            '  "size": "data.size"\n' +
            '}').description('全局字段映射 JSON'),
    }).description('API 与平台'),
    koishi_1.Schema.object({
        waitingTipText: koishi_1.Schema.string().default('正在解析音乐，请稍候...').description('等待提示'),
        unsupportedPlatformText: koishi_1.Schema.string().default('暂不支持该平台音乐链接').description('不支持提示'),
        invalidLinkText: koishi_1.Schema.string().default('无效的音乐链接').description('无效链接提示'),
        parseErrorPrefix: koishi_1.Schema.string().default('❌ 解析失败：').description('错误前缀'),
        parseErrorItemFormat: koishi_1.Schema.string().default('【${url}】: ${msg}').description('错误格式'),
    }).description('界面文本'),
]);
function apply(ctx, config) {
    const logger = new koishi_1.Logger(exports.name);
    const debug = new utils_1.DebugLogger(logger, config.debug || false);
    debug.log('INFO', '音乐解析插件启动');
    const dedupEnabled = config.enableDeduplication !== false;
    const dedupInterval = (config.deduplicationInterval || 180) * 1000;
    const cacheTTL = (config.cacheTTL || 600) * 1000;
    const dedupCache = new cache_1.SimpleLRUCache(1000, dedupInterval);
    const contentDedupCache = new cache_1.SimpleLRUCache(1000, dedupInterval);
    const urlCacheLocal = new cache_1.SimpleLRUCache(500, cacheTTL);
    const texts = {
        waitingTipText: config.waitingTipText || '正在解析音乐，请稍候...',
        unsupportedPlatformText: config.unsupportedPlatformText || '暂不支持该平台音乐链接',
        invalidLinkText: config.invalidLinkText || '无效的音乐链接',
        parseErrorPrefix: config.parseErrorPrefix || '❌ 解析失败：',
        parseErrorItemFormat: config.parseErrorItemFormat || '【${url}】: ${msg}',
    };
    const customPlatforms = (0, platform_1.normalizeCustomPlatforms)(config.customPlatforms || []);
    const resolver = new platform_1.PlatformResolver(config, customPlatforms);
    const proxyConfig = config.proxy || {};
    const axiosConfig = {
        timeout: config.timeout,
        headers: {
            'User-Agent': config.userAgent,
            'Referer': 'https://www.baidu.com/',
        },
    };
    if (proxyConfig.enabled && proxyConfig.host) {
        axiosConfig.proxy = {
            protocol: proxyConfig.protocol || 'http',
            host: proxyConfig.host,
            port: proxyConfig.port || 7890,
            auth: proxyConfig.auth?.username ? {
                username: proxyConfig.auth.username,
                password: proxyConfig.auth.password || '',
            } : undefined,
        };
    }
    const http = axios_1.default.create(axiosConfig);
    const customHeaders = config.customHeaders || [];
    http.interceptors.request.use(cfg => {
        for (const header of customHeaders) {
            if (header.name && header.value)
                cfg.headers[header.name] = header.value;
        }
        return cfg;
    });
    const apiClient = new api_1.ApiClient({ http, config, dedupEnabled, cacheTTL, urlCache: urlCacheLocal, debug });
    function contentFingerprint(p) {
        const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '');
        const name = normalize(p.name);
        const artist = normalize(p.artist);
        if (name || artist)
            return [name, artist].join('::');
        return [p.type, p.musicUrl].map(v => normalize(v)).join('::');
    }
    async function sendWithTimeout(session, content, customRetries) {
        const maxRetries = customRetries ?? config.retryTimes ?? 3;
        const retryDelay = config.retryInterval || 1000;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            let timer;
            try {
                const sendPromise = session.send(content);
                if (config.videoSendTimeout > 0) {
                    const timeoutPromise = new Promise((_, reject) => {
                        timer = setTimeout(() => reject(new Error('发送超时')), config.videoSendTimeout);
                    });
                    return await Promise.race([sendPromise, timeoutPromise]);
                }
                return await sendPromise;
            }
            catch (err) {
                const errMsg = (0, utils_1.getErrorMessage)(err);
                debug.log('ERROR', `发送失败尝试 ${attempt + 1}: ${errMsg}`);
                if (attempt < maxRetries) {
                    await (0, utils_1.delay)(retryDelay);
                }
                else if (!config.ignoreSendError) {
                    throw err;
                }
            }
            finally {
                if (timer)
                    clearTimeout(timer);
            }
        }
        return null;
    }
    async function flush(session, matches) {
        debug.log('INFO', `开始解析 ${matches.length} 个链接`);
        const items = [];
        const errors = [];
        const limiter = new cache_1.ConcurrencyLimiter(config.maxConcurrent || 3);
        const promises = matches.map(async (match) => {
            await limiter.acquire();
            try {
                const platformEnabled = config.platformEnabled?.[match.type] ?? true;
                if (!platformEnabled && !match.type.startsWith('custom_')) {
                    debug.log('INFO', `平台 ${match.type} 已禁用，跳过链接: ${match.url}`);
                    return;
                }
                if (dedupEnabled && config.deduplicationInterval > 0) {
                    const lastTime = dedupCache.get(match.url);
                    if (lastTime && (Date.now() - lastTime < config.deduplicationInterval * 1000)) {
                        debug.log('INFO', `跳过重复链接: ${match.url}`);
                        return;
                    }
                }
                debug.log('INFO', `解析链接: ${match.url} (${match.type})`);
                const platformConf = resolver.resolve(match.type);
                try {
                    const parsed = await apiClient.fetch(match.url, match.type, match.id, platformConf);
                    if (dedupEnabled && config.deduplicationInterval > 0) {
                        const fp = contentFingerprint(parsed);
                        const lastDedup = contentDedupCache.get(fp);
                        if (lastDedup && (Date.now() - lastDedup < config.deduplicationInterval * 1000)) {
                            debug.log('INFO', `跳过重复内容: ${match.url}`);
                            return;
                        }
                        contentDedupCache.set(fp, Date.now());
                        dedupCache.set(match.url, Date.now());
                    }
                    items.push({ text: (0, utils_1.generateFormattedText)(parsed, config.unifiedMessageFormat), parsed });
                    lastLinks.set(session.gid, { type: match.type, url: match.url, id: match.id, name: parsed.name });
                }
                catch (error) {
                    const msg = (0, utils_1.getErrorMessage)(error);
                    const displayUrl = match.url.length > 50 ? match.url.slice(0, 50) + '...' : match.url;
                    errors.push(texts.parseErrorItemFormat.replace(/\$\{url\}/g, displayUrl).replace(/\$\{msg\}/g, msg));
                }
            }
            finally {
                limiter.release();
            }
        });
        await Promise.all(promises);
        const seenSongs = new Set();
        for (let i = 0; i < items.length; i++) {
            const p = items[i].parsed;
            const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '');
            const key = [normalize(p.name), normalize(p.artist)].join('::');
            if (seenSongs.has(key)) {
                items.splice(i, 1);
                i--;
                continue;
            }
            seenSongs.add(key);
        }
        if (errors.length)
            await sendWithTimeout(session, `${texts.parseErrorPrefix}\n${errors.join('\n')}`);
        if (!items.length)
            return;
        const enableForward = config.enableForward && (session.platform === 'onebot' || session.platform === 'satori');
        const botName = config.botName || '音乐解析机器人';
        if (enableForward) {
            const forwardMessages = [];
            for (const item of items) {
                const p = item.parsed;
                if (item.text && config.showMusicText)
                    forwardMessages.push((0, utils_1.buildForwardNode)(session, item.text, botName));
                if (p.cover && config.showCoverImage)
                    forwardMessages.push((0, utils_1.buildForwardNode)(session, koishi_1.h.image(p.cover), botName));
                if (p.musicUrl && config.showMusicVoice)
                    forwardMessages.push((0, utils_1.buildForwardNode)(session, koishi_1.h.audio(p.musicUrl), botName));
            }
            if (forwardMessages.length) {
                try {
                    await sendWithTimeout(session, (0, koishi_1.h)('message', { forward: true }, forwardMessages.slice(0, 100)), config.retryTimes);
                }
                catch (err) {
                    debug.log('ERROR', '合并转发失败，降级逐条发送:', err);
                    for (const node of forwardMessages) {
                        await sendWithTimeout(session, node.data.content).catch(() => { });
                        await (0, utils_1.delay)(300);
                    }
                }
            }
        }
        else {
            for (const item of items) {
                const p = item.parsed;
                const parts = [];
                if (item.text && config.showMusicText)
                    parts.push(item.text);
                if (p.cover && config.showCoverImage) {
                    if (parts.length)
                        parts[0] = parts[0] + "\n封面：";
                    else
                        parts.push("封面：");
                    parts.push(koishi_1.h.image(p.cover));
                }
                if (parts.length) {
                    try {
                        await sendWithTimeout(session, parts.length === 1 ? parts[0] : parts);
                    }
                    catch (err) {
                        for (const part of parts) {
                            await sendWithTimeout(session, part).catch(() => { });
                            await (0, utils_1.delay)(200);
                        }
                    }
                    await (0, utils_1.delay)(300);
                }
                if (p.musicUrl && config.sendFullFile && !p.preview) {
                    if (config.showMusicVoice) {
                        try {
                            await sendWithTimeout(session, koishi_1.h.audio(p.musicUrl));
                        }
                        catch {
                        }
                    }
                    try {
                        const fileName = String(p.name || 'music').replace(/[\\/:*?"<>|]/g, '_') + '.mp3';
                        await sendWithTimeout(session, koishi_1.h.file(p.musicUrl, { title: fileName }));
                    }
                    catch {
                        await sendWithTimeout(session, `音乐链接：${p.musicUrl}`).catch(() => { });
                    }
                }
                else if (p.musicUrl && config.showMusicVoice) {
                    if (p.preview) {
                        try {
                            await sendWithTimeout(session, koishi_1.h.audio(p.musicUrl));
                        }
                        catch {
                        }
                        await sendWithTimeout(session, `该歌曲仅提供官方试听${p.previewSeconds ? `（${p.previewSeconds} 秒）` : ''}，无法获取完整文件`).catch(() => { });
                    }
                    else if (config.showMusicVoiceFile) {
                        try {
                            await sendWithTimeout(session, koishi_1.h.audio(p.musicUrl));
                            await sendWithTimeout(session, '要完整音频文件吗？15 秒内回复「是」获取');
                            askState.set(session.gid, { until: Date.now() + 15000, url: p.musicUrl, name: p.name });
                            setTimeout(() => {
                                const st = askState.get(session.gid);
                                if (st && Date.now() >= st.until)
                                    askState.delete(session.gid);
                            }, 16000);
                        }
                        catch {
                            await sendWithTimeout(session, `音乐链接：${p.musicUrl}`).catch(() => { });
                        }
                    }
                    else {
                        await sendWithTimeout(session, `音乐链接：${p.musicUrl}`).catch(() => { });
                    }
                    await (0, utils_1.delay)(500);
                }
            }
        }
        debug.log('INFO', '处理完成');
    }
    const customRules = (0, parser_1.buildCustomLinkRules)(config.customPlatforms || []);
    const lastLinks = new Map();
    const askState = new Map();
    ctx.middleware(async (session, next) => {
        const st = askState.get(session.gid);
        if (!st || Date.now() > st.until)
            return next();
        askState.delete(session.gid);
        if (!/^(是|要|好|好的|需要|嗯|y|yes)$/i.test(String(session.content || '').trim()))
            return next();
        try {
            const fileName = String(st.name || 'music').replace(/[\\/:*?"<>|]/g, '_') + '.mp3';
            await session.send(koishi_1.h.file(st.url, { title: fileName }));
        }
        catch (e) {
            await session.send('发送文件失败：' + (e && e.message ? e.message : e));
        }
    });
    ctx.on('message', async (session) => {
        if (!config.enable)
            return;
        if (/^\s*(?:parse|music-parse)\b/i.test(session.content || ''))
            return;
        if (session.subtype === 'file_upload')
            return;
        if (session.elements?.some(elem => elem.type === 'file' || elem.type === 'folder'))
            return;
        if (session.selfId === session.userId)
            return;
        const matches = (0, parser_1.extractAllUrlsFromMessage)(session, customRules);
        if (!matches.length)
            return;
        debug.log('INFO', `检测到 ${matches.length} 个音乐链接`);
        if (config.showWaitingTip) {
            try {
                await sendWithTimeout(session, texts.waitingTipText);
            }
            catch (e) {
                debug.log('WARN', '等待提示发送失败:', e);
            }
        }
        await flush(session, matches);
    });
    ctx.command('music-parse <url>', '手动解析音乐').action(async ({ session }, url) => {
        if (!url) {
            await sendWithTimeout(session, texts.invalidLinkText);
            return;
        }
        const matches = (0, parser_1.linkTypeParser)(url, customRules);
        if (!matches.length) {
            await sendWithTimeout(session, texts.invalidLinkText);
            return;
        }
        if (config.showWaitingTip) {
            try {
                await sendWithTimeout(session, texts.waitingTipText);
            }
            catch { }
        }
        await flush(session, matches);
    });
    ctx.command('music-file [url:text]').alias('音乐文件').usage('发送上一首音乐的完整音频文件，或指定链接').action(async ({ session }, url) => {
        if (!session)
            return;
        let target = null;
        if (url) {
            const list = (0, parser_1.linkTypeParser)(url, customRules);
            if (list.length)
                target = list[0];
        }
        else {
            target = lastLinks.get(session.gid);
        }
        if (!target) {
            await sendWithTimeout(session, '没有可发送的歌曲，请先发一条音乐链接，或用「音乐文件 <链接>」。');
            return;
        }
        try {
            const parsed = await require('./meting').resolve(target.type, target.url, target.id);
            if (parsed.preview) {
                await sendWithTimeout(session, `该歌曲仅提供官方试听${parsed.previewSeconds ? `（${parsed.previewSeconds} 秒）` : ''}，无法获取完整文件`);
                return;
            }
            const fileName = String(parsed.name || target.name || 'music').replace(/[\\/:*?"<>|]/g, '_') + '.mp3';
            await sendWithTimeout(session, koishi_1.h.file(parsed.musicUrl, { title: fileName }));
        }
        catch (e) {
            await sendWithTimeout(session, '获取文件失败：' + (e && e.message ? e.message : e));
        }
    });
    ctx.on('dispose', () => {
        urlCacheLocal.clear();
        dedupCache.clear();
        debug.log('INFO', '音乐解析插件已卸载');
    });
    debug.log('INFO', '音乐解析插件初始化完成');
}
