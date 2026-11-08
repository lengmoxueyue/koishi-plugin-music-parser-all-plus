# koishi-plugin-music-parser-all-plus

A music-link parser plugin for [Koishi](https://koishi.chat/): **NetEase Cloud Music, QQ Music (including mobile short links and share cards), Kugou, Kuwo and Qishui**.

Send a music link (or share card) in chat and the bot replies with song info + cover, a voice message, and — on request — the full MP3 file.

> This repository is an **enhanced fork** of [Minecraft-1314/koishi-plugin-music-parser-all](https://github.com/Minecraft-1314/koishi-plugin-music-parser-all).
> The QQ Music and Kugou backends were rewritten, and an "ask-then-send-file" flow was added.

## Features

- Auto-detect links from NetEase, QQ Music, Kugou, Kuwo and Qishui
- QQ Music: web links, mobile short links (`c6.y.qq.com/base/fcgi-bin/u?__=`) and JSON share cards
- Kugou: parses the share page directly (title / artist / cover / full audio)
- Song info and cover are sent as **one message**
- Voice first, full file on demand: the bot asks `要完整音频文件吗？15 秒内回复「是」获取` after the voice message
- Per-platform switches
- Customisable text template with `${name}`, `${artist}`, `${album}`, `${level}`, `${size}` (empty lines are hidden)

## Installation

```bash
yarn add koishi-plugin-music-parser-all-plus
```

or from this repository:

```bash
yarn add github:lengmoxueyue/koishi-plugin-music-parser-all-plus
```

## Usage

Send any supported link, or forward a QQ Music share card:

```
https://music.163.com/song?id=1234567
https://y.qq.com/n/ryqq/songDetail/004VUs6v0K5P1w
https://c6.y.qq.com/base/fcgi-bin/u?__=j5dedKw0qXgO
https://m.kugou.com/share/song.html?chain=1DsL3dfG7V2
https://www.kuwo.cn/play_detail/123456
https://qishui.douyin.com/s/xxxxxx
```

### Flow

1. Bot sends song info + cover (single message)
2. Bot sends a voice message (QQ limits voice to 60 seconds)
3. Bot asks: `要完整音频文件吗？15 秒内回复「是」获取`
4. Reply `是 / 要 / 好 / 需要 / 嗯 / y / yes` → receive the full MP3 file
5. No reply within 15 seconds → the prompt expires

### Commands

| Command | Description |
|---|---|
| `music-parse <url>` | Parse a given link manually |
| `music-file` | Send the full audio file of the last song in this channel |
| `music-file <url>` | Parse a link and send the file directly |

## Configuration

| Option | Description |
|---|---|
| `enable` | Enable the plugin |
| `platformEnabled` | Per-platform switches (NetEase / Kuwo / QQ Music / Qishui) |
| `unifiedMessageFormat` | Text template with variable substitution |
| `showMusicText` / `showCoverImage` | Send text / cover |
| `showMusicVoice` / `showMusicVoiceFile` | Send voice / send as voice (disable to send the link instead) |
| `showWaitingTip` | Show a "parsing..." tip |
| `debug` | Debug logging |

## Known limitations

- **QQ voice messages are limited to 60 seconds**; use the prompt or `music-file` for the full track.
- **Kugou has no album name** in its share page, so the album line stays empty.
- Paid / region-restricted tracks may not return an audio URL; QQ Music failures automatically try a matching free NetEase version first.
- Uploading files requires the bot to have permission in the group; it falls back to voice/link on failure.
- Third-party parsing endpoints may change or break at any time; update `lib/meting.js` accordingly.

## Changelog

### 0.1.9

- Parse share cards (music elements) from NetEase, Kugou, Kuwo and Qishui
- QQ Music cards now handle numeric songid and songmid correctly
- Share cards are normalized into the same platform link rules

### 0.1.8

- Parse QQ Music share cards (music / json / ark elements), fixing no response to card messages

### 0.1.7

- When QQ Music has no playable URL, automatically search NetEase for a matching free version and fall back to it
- Kugou failures also try the NetEase fallback
- Paid/region-restricted tracks can still fail when no free source exists on any platform

### 0.1.4

- Added a Meting backend for QQ Music and NetEase (plus official metadata APIs)
- Added Kugou share-page parsing
- Support for QQ Music mobile short links and JSON share cards
- Song info + cover merged into one message, with a `封面：` label
- Ask-then-send-file flow after the voice message
- New `music-file` command
- De-duplicate multiple links pointing to the same song inside a share card
- Plugin usage text and Chinese comments

## Credits

- Original author: [Minecraft-1314](https://github.com/Minecraft-1314)
- Audio resolution: [Meting API](https://github.com/metowolf/Meting)

## License

MIT — see [LICENSE](./LICENSE).
