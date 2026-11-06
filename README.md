# 第零序列 · THE ZERO SEQUENCE

《第零序列》的公开读者网站。

## 入口

- `index.html`：首页
- `parts/`、`volumes/`、`chapters/`：正式公开篇章、20卷目录与200章正文及序章
- `archive/characters.html`：按阅读进度显示的公开人物图鉴
- `archive/classes.html`：公开基础职业图鉴
- `archive/unlocks.html`：分篇独立解锁记录
- `archive/quests.html`：已发布剧情事件索引
- `archive/` 其他专题：仅展示经过读者发布审核的里程碑摘要

## 公开/私人边界

本仓库完全公开。网页上的锁定只用于阅读体验，不能保护源代码或 Git 历史。

作者原始世界观、隐藏职业、人物完整命运、设计草案与内部数据存于独立 **Private** 仓库；请勿把它们直接放回本仓库。

当前站点曾经公开过详细作者底稿，**旧提交历史可能仍可访问**。需要在新建干净公开仓库后完成发布迁移，才能避免本站当前地址直接暴露这些历史提交。

详情见 [PUBLICATION_BOUNDARY.md](PUBLICATION_BOUNDARY.md)。

发布前运行 `node scripts/audit-public-boundary.mjs`，禁止作者内部文件进入公开网站。

## 阅读数据

阅读进度仅储存在浏览器 `localStorage` 中，默认不跨设备同步。所有已发布章节可直接阅读；人物、任务与世界档案则按每篇已读进度逐步显示。

> 故事尚在书写，命运仍未定稿。
