# koishi-plugin-music-parser-all-plus

[![npm](https://img.shields.io/npm/v/koishi-plugin-music-parser-all-plus?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-music-parser-all-plus)

Koishi 全平台音乐解析插件：**网易云 / QQ 音乐（含手机短链、分享卡片）/ 酷狗 / 酷我 / 汽水**。
自动识别聊天中的音乐链接或分享卡片，发送歌曲信息、封面、语音，并在需要时提供**完整音频文件**。

> 本仓库是 [Minecraft-1314/koishi-plugin-music-parser-all](https://github.com/Minecraft-1314/koishi-plugin-music-parser-all) 的**增强分支（fork）**，
> 在原版基础上重做了 QQ 音乐与酷狗的解析后端，并新增「询问是否发送完整音频文件」的交互。原版版权与许可见文末。

## 功能特性

- **全平台自动解析**：网易云、QQ 音乐、酷狗、酷我、汽水音乐
- **QQ 音乐三种形态都支持**：网页链接、手机分享短链（`c6.y.qq.com/base/fcgi-bin/u?__=`）、QQ 分享卡片（JSON 富消息）
- **酷狗分享链接**：直接解析分享页，拿歌名 / 歌手 / 封面 / 完整音频
- **一条消息呈现**：文字信息 + 封面图合并为一个气泡，不会刷屏
- **语音优先，文件按需**：先发语音（QQ 语音最长 60 秒），随后询问是否需要完整文件，回复「是」即发送完整 mp3
- **平台级开关**：每个平台可以单独启停
- **自定义文案**：文字内容支持 `${name}`、`${artist}`、`${album}`、`${level}`、`${size}` 变量，空值行自动隐藏

## 安装

### 从 Koishi 控制台

在「插件市场」搜索 `koishi-plugin-music-parser-all-plus` 安装，或直接执行：

```bash
yarn add koishi-plugin-music-parser-all-plus
```

### 从本仓库安装

```bash
yarn add github:lengmoxueyue/koishi-plugin-music-parser-all-plus
```

安装后在「插件配置」中启用并填写配置。

## 使用

把音乐链接直接发到群里即可：

```
https://music.163.com/song?id=1234567
https://y.qq.com/n/ryqq/songDetail/004VUs6v0K5P1w
https://c6.y.qq.com/base/fcgi-bin/u?__=j5dedKw0qXgO
https://m.kugou.com/share/song.html?chain=1DsL3dfG7V2
https://www.kuwo.cn/play_detail/123456
https://qishui.douyin.com/s/xxxxxx
```

或者直接转发 QQ 音乐的分享卡片。

### 发送流程

1. Bot 回复「文字 + 封面」合并消息
2. Bot 发送语音（最长 60 秒）
3. Bot 追问：`要完整音频文件吗？15 秒内回复「是」获取`
4. 回复 `是 / 要 / 好 / 好的 / 需要 / 嗯 / y / yes` → 收到完整 mp3 文件
5. 不回复则 15 秒后自动作废

### 命令

| 命令 | 说明 |
|---|---|
| `music-parse <链接>` | 手动解析指定链接 |
| `music-file` | 发送当前频道上一首歌的完整音频文件 |
| `music-file <链接>` | 解析指定链接并直接发送文件（不经过语音） |

## 配置说明

| 配置项 | 说明 |
|---|---|
| `enable` | 是否启用插件 |
| `platformEnabled` | 各平台解析开关（网易云 / 酷我 / QQ 音乐 / 汽水；酷狗随通用规则启用） |
| `unifiedMessageFormat` | 文字模板，支持 `${name}` `${artist}` `${album}` `${level}` `${size}`，空行自动隐藏 |
| `showMusicText` / `showCoverImage` | 是否发送文字 / 封面 |
| `showMusicVoice` / `showMusicVoiceFile` | 是否发送语音 / 是否以语音形式发送（关闭则只发链接） |
| `showWaitingTip` | 解析时是否发送等待提示 |
| `debug` | 调试日志 |

> 默认模板：
> ```
> 歌名：${name}
> 歌手：${artist}
> 专辑：${album}
> 音质：${level}
> 大小：${size}
> ```

## 支持的平台与数据来源

| 平台 | 链接形式 | 数据来源 |
|---|---|---|
| 网易云 | `music.163.com/song?id=`、`163cn.tv/`、`y.music.163.com/m/song?id=` | Meting + 网易云歌曲详情接口 |
| QQ 音乐 | `y.qq.com/n/ryqq/songDetail/`、`i.y.qq.com/v8/playsong.html`、`c6.y.qq.com/.../u?__=`、分享卡片 | Meting + QQ 音乐元数据接口 |
| 酷狗 | `m.kugou.com/share/song.html?chain=`、`www.kugou.com/song/#hash=`、任意带 `hash=32位` 的链接 | 直接解析酷狗分享页 |
| 酷我 | `www.kuwo.cn/play_detail/` | 原版接口 |
| 汽水 | `qishui.douyin.com/s/` | 原版接口 |

## 已知限制

- **QQ 语音最长 60 秒**：超过部分会被截断，这是 QQ 平台限制；需要完整音频请使用「询问后回复是」或 `music-file` 命令。
- **酷狗没有专辑名**：酷狗分享页只提供 `album_id` 与封面，没有专辑名字段，因此「专辑」行会为空（自动隐藏）。
- **付费 / 版权受限歌曲**：QQ 音乐拿不到音源时会自动尝试网易云同名免费版本；仍失败才提示解析失败。
- **群文件权限**：发送完整文件需要机器人在群内有上传文件的权限，失败时会自动回退为语音或链接。
- **解析接口由第三方提供**，可能随时变动或失效，届时需要更新 `lib/meting.js` 中的接口地址。

## 自建 Meting API

设置环境变量 `METING_API=http://127.0.0.1:3030/meting/` 即可让插件使用自建 Meting 服务（默认走公共实例）。付费歌曲仍需在 Meting 服务端配置对应平台 Cookie。

## 变更记录

### 0.2.2

- `sendFullFile` 现在会保留语音，并在语音后追发完整 mp3 文件

### 0.2.1

- 新增 `sendFullFile` 配置：解析到完整音频时直接发送 mp3 文件，不再先发 60 秒语音并追问；默认关闭

### 0.2.0

- 支持通过 `METING_API` 环境变量指向自建 Meting API
- 酷狗 60 秒试听检测：只发官方试听并提示，不再把试听当完整文件
- 同一条分享内重复链接按歌名 + 歌手去重，避免重复回复

### 0.1.9

- 支持网易云、酷狗、酷我、汽水等平台的分享卡片（music 元素）解析
- QQ 音乐卡片兼容数字 songid，自动区分 songmid / songid
- 卡片解析统一走各平台链接规则，减少“卡片没反应”的情况

### 0.1.8

- 支持 QQ 音乐分享卡片（music / json / ark 元素）解析，修复卡片消息无反应

### 0.1.7

- QQ 音乐解析不到音源时，自动按歌名/歌手搜索网易云免费版本并回退播放
- 酷狗解析失败时同样尝试网易云回退
- 付费/版权歌曲仍可能因全平台无免费源而失败

### 0.1.4

- 新增 Meting 后端，QQ 音乐与网易云改走 Meting + 官方元数据接口
- 新增酷狗分享页解析（歌名 / 歌手 / 封面 / 完整音频）
- 支持 QQ 音乐手机短链与 QQ 分享卡片（JSON 富消息）
- 文字与封面合并为一条消息发送，并新增「封面：」标签
- 语音发送后询问是否获取完整音频文件，回复「是」即发送 mp3
- 新增 `music-file` 命令（按需获取完整文件）
- 同一分享卡片内的多条链接按歌曲 ID 去重
- 新增插件说明（usage）与更完整的中文注释

### 0.1.3

- 原版功能

## 致谢

- 原插件作者：[Minecraft-1314](https://github.com/Minecraft-1314)
- 音频解析：[Meting API](https://github.com/metowolf/Meting)

## License

MIT License

Copyright (c) 2024 Minecraft-1314（原版）
Copyright (c) 2026 lengmoxueyue（本分支的修改）

详见 [LICENSE](./LICENSE)。
