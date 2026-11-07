"use strict";
const http = require("node:http");
const https = require("node:https");
const METING = "https://api.injahow.cn/meting/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";
function request(url, opts) {
  opts = opts || {};
  const maxRedirects = opts.maxRedirects == null ? 0 : opts.maxRedirects;
  const timeout = opts.timeout || 15000;
  return new Promise((resolve, reject) => {
    let target;
    try { target = new URL(url); } catch (e) { return reject(e); }
    const mod = target.protocol === "https:" ? https : http;
    const req = mod.request(target, {
      method: opts.method || "GET",
      timeout,
      headers: Object.assign({ "User-Agent": UA, "Accept": "*/*" }, opts.headers || {})
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        res.resume();
        resolve(request(new URL(res.headers.location, url).href, Object.assign({}, opts, { maxRedirects: maxRedirects - 1 })));
        return;
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { data += c; });
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data, url }));
    });
    req.on("timeout", () => req.destroy(new Error("request timeout")));
    req.on("error", reject);
    req.end();
  });
}
async function metingText(server, type, id) {
  const res = await request(METING + "?server=" + server + "&type=" + type + "&id=" + encodeURIComponent(id), { maxRedirects: 3 });
  return (res.body || "").trim();
}
async function metingAudio(server, id) {
  const res = await request(METING + "?server=" + server + "&type=url&id=" + encodeURIComponent(id), { maxRedirects: 0 });
  if (res.status >= 300 && res.status < 400 && res.headers.location) {
    const loc = res.headers.location;
    return /^https?:/i.test(loc) ? loc : null;
  }
  return null;
}
async function qqMeta(param, value) {
  try {
    const url = "https://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg?" + param + "=" + encodeURIComponent(value) + "&platform=yqq&format=json";
    const res = await request(url, { maxRedirects: 3, headers: { Referer: "https://y.qq.com/" } });
    const j = JSON.parse(res.body);
    const d = j && j.data && j.data[0];
    if (!d) return null;
    const singers = (d.singer || []).map((s) => s.name).filter(Boolean).join("/");
    return { mid: d.mid, name: d.name, artist: singers, album: d.album && d.album.name, albumMid: d.album && d.album.mid };
  } catch (e) { return null; }
}
async function resolveQq(url, matchId) {
  let mid = null, songid = null, m;
  m = url.match(/songDetail\/([A-Za-z0-9]+)/); if (m) mid = m[1];
  m = url.match(/songmid=([A-Za-z0-9]+)/); if (m) mid = m[1];
  m = url.match(/songid=(\d+)/); if (m) songid = m[1];
  if (!mid && !songid) {
    const res = await request(url, { maxRedirects: 5, headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15" } });
    const fin = res.url || "";
    m = fin.match(/songDetail\/([A-Za-z0-9]+)/); if (m) mid = m[1];
    m = fin.match(/songmid=([A-Za-z0-9]+)/); if (m) mid = m[1];
    m = fin.match(/songid=(\d+)/); if (m) songid = m[1];
    if (!mid && !songid) { m = (fin + " " + res.body).match(/songid=(\d+)/); if (m) songid = m[1]; }
  }
  let meta = songid ? await qqMeta("songid", songid) : null;
  if (!meta && mid) meta = await qqMeta("songmid", mid);
  if (!mid && meta && meta.mid) mid = meta.mid;
  if (!mid && !songid) throw new Error("无法从 QQ 音乐链接解析歌曲 ID");
  const name = (meta && meta.name) || (mid ? await metingText("tencent", "name", mid) : "");
  const artist = (meta && meta.artist) || (mid ? await metingText("tencent", "artist", mid) : "");
  const album = (meta && meta.album) || "";
  const cover = meta && meta.albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + meta.albumMid + ".jpg" : "";
  const musicUrl = mid ? await metingAudio("tencent", mid) : null;
  if (!musicUrl) throw new Error("该歌曲暂无可用音源（可能是付费/版权限制）");
  return { type: "qqmusic", name: name || "", artist: artist || "", album: album || "", cover: cover || "", musicUrl, level: "", size: "" };
}
function unescapeJson(s) {
  return s.replace(/\\u([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\\//g, "/");
}
async function resolveKugou(url, matchId) {
  const res = await request(url, { maxRedirects: 5, headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15" } });
  const body = res.body || "";
  const pick = (re) => { const m = body.match(re); return m ? unescapeJson(m[1]) : ""; };
  const name = pick(/"songName":"(.*?)"/);
  const artist = pick(/"author_name":"(.*?)"/);
  const cover = pick(/"album_img":"(.*?)"/).replace("{size}", "480");
  const audio = pick(/"backup_url":\["(.*?)"\]/);
  if (audio && /^https?:/i.test(audio)) {
    return { type: "kugou", name, artist, album: "", cover, musicUrl: audio, level: "", size: "" };
  }
  let hash = /^[0-9A-Fa-f]{32}$/.test(matchId || "") ? matchId : null;
  if (!hash) {
    const m = body.match(/"(?:hash|req_hash)":"([0-9A-Fa-f]{32})"/i);
    if (m) hash = m[1];
  }
  if (!hash) throw new Error("无法从酷狗链接解析歌曲 hash");
  const mn = await metingText("kugou", "name", hash);
  if (!mn || /unknown song/i.test(mn)) throw new Error("酷狗接口暂不支持该歌曲");
  const ma = await metingText("kugou", "artist", hash);
  const mu = await metingAudio("kugou", hash);
  if (!mu) throw new Error("该歌曲暂无可用音源");
  return { type: "kugou", name: mn, artist: ma, album: "", cover: "", musicUrl: mu, level: "", size: "" };
}async function neteaseDetail(id) {
  try {
    const url = "https://music.163.com/api/song/detail/?id=" + id + "&ids=%5B" + id + "%5D";
    const res = await request(url, { maxRedirects: 3, headers: { Referer: "https://music.163.com/", "User-Agent": UA } });
    const j = JSON.parse(res.body);
    const s = j && j.songs && j.songs[0];
    if (!s) return null;
    return {
      name: s.name,
      artist: (s.artists || []).map((a) => a.name).filter(Boolean).join("/"),
      album: s.album && s.album.name,
      cover: s.album && s.album.picUrl
    };
  } catch (e) { return null; }
}
async function resolveNetease(url, matchId) {
  let id = /^\d+$/.test(matchId || "") ? matchId : null;
  let m;
  if (!id) { m = url.match(/[?&#]id=(\d+)/); if (m) id = m[1]; }
  if (!id) {
    const res = await request(url, { maxRedirects: 5, headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15" } });
    const fin = res.url || "";
    m = fin.match(/[?&#]id=(\d+)/);
    if (m) id = m[1];
    if (!id) { m = (fin + " " + (res.body || "")).match(/\bid=(\d+)/); if (m) id = m[1]; }
  }
  if (!id) throw new Error("无法从网易云链接解析歌曲 ID");
  const meta = await neteaseDetail(id);
  const name = (meta && meta.name) || await metingText("netease", "name", id);
  const artist = (meta && meta.artist) || await metingText("netease", "artist", id);
  const album = (meta && meta.album) || "";
  let cover = (meta && meta.cover) || "";
  if (cover) cover = cover.replace(/^http:/, "https:");
  const musicUrl = await metingAudio("netease", id);
  if (!musicUrl) throw new Error("该歌曲暂无可用音源（可能是付费/版权限制）");
  return { type: "netease", name: name || "", artist: artist || "", album: album || "", cover: cover || "", musicUrl, level: "", size: "" };
}
async function resolve(type, url, matchId) {
  if (type === "netease") return resolveNetease(url, matchId);
  if (type === "qqmusic") return resolveQq(url, matchId);
  if (type === "kugou") return resolveKugou(url, matchId);
  return null;
}
module.exports = { resolve };
