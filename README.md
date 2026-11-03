# 第零序列 · THE ZERO SEQUENCE

《第零序列》官方小说书库网站。

## 网站结构
- `index.html` — 首页 / 藏书目录
- `volumes/` — 各卷目录
- `chapters/` — 小说正文
- `archive/characters.html` — 人物图鉴
- `archive/classes.html` — 职业体系
- `archive/world.html` — 世界地图
- `archive/factions.html` — 势力档案
- `assets/` — 样式与后续图片资源

网站为纯静态结构，可直接通过 GitHub Pages 发布。

> 故事尚在书写，命运仍未定稿。

## Reader features / publishing notes (2026-11)

- `assets/js/reader-experience.js` loads automatically from the common `audio-player.js` script. It adds per-device reading preferences, paragraph/percentage progress and a home-page resume card. No user account, cloud sync or telemetry is used.
- `search.html` uses the static index at `assets/data/search-index.json` (public chapter titles, volume intros and published archive links only). **Update the index when publishing new chapters.** Do not put unpublished canon, author notes or spoilers into that index.
- `archive/world.html` is an interactive *schematic explorer*, not a surveyed or canon geographic map. Coordinates are UI layout positions only.
- `parts/recap-01.html` contains first-part recaps with a spoiler warning. Every ten volumes form a part.
- `assets/js/narrator-pro.js` uses the reader's browser speech voices. `assets/js/narration-official.js` is only an optional future ready-audio integration; do not describe it as professionally recorded until audio assets exist.
- User approved character backgrounds and the final world-ending design should not be uploaded into the public website archive before publication and spoiler review.
