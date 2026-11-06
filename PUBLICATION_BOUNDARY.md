# 《第零序列》公开网站与作者内部资料隔离规范

> 本仓库 **prolv202020-maker/zero-sequence 是公开仓库**。GitHub Pages、仓库源码以及历史提交均可能被任何人阅读。
> **文件改名、放隐藏目录、分支、压缩包、CSS 隐藏、JS 锁或 localStorage 解锁，都不等于保密。**

## 一、公开站点的范围（Public）

- `chapters/`：经作者确认已发布的章节正文。
- `volumes/`、`parts/`：正式卷目录、公开篇章与防剧透版回顾。
- `archive/`：只放符合**已发布正文**的读者资料，严禁作者内参。
- `assets/data/`：只放读者可直接下载的已公开结构化资料。
- `assets/js/`：仅放公开前端程序，不可内嵌作者隐藏结局或密钥。

## 二、必须存放于私人仓库（Private）

- 尚未发表的第三篇以后剧情、总纲、结局与神魔终极机制。
- 人物完整命运、背叛与牺牲安排、秘密职业最终阶段、未公开人物关系。
- 原型资料、内部小说设定档案、备选职业、备选任务、创作经济模型和草稿。
- 仅作者使用的图片原稿、敏感授权资料及任何未获批准的素材。
- `WRITING_STANDARD.md` 等作者专用编辑资料（目前仍留在公开历史，等待安全迁移）。

## 三、正确的工作流

1. **先由作者在 GitHub 创建 PRIVATE 仓库**，建议名称 `zero-sequence-author`，并允许当前 GitHub 连接访问；不要在公开仓库新建所谓“私有目录”。
2. 将需要保留的作者原始资料**复制**进私人仓库，并核对文件完整、可读取；在确认备份前不得从公开仓库删除原始资料。
3. 从私人资料人工审核，生成“读者公开摘要 / 正式卷章内容 / 按进度解锁的索引”三个产物，**只把已批准产物**同步到本公开仓库。
4. 对现有公开仓库逐文件清理内部资料，禁止复制作者原稿到 `assets/data`、HTML、JS、CSS、注释及搜索索引。
5. 做页面与源码双重检查：`node scripts/audit-public-boundary.mjs`。关键剧情的公开节点应按正式章节清单检查。
6. 如果历史提交曾暴露需要真正保密的资料，应规划**重建公开仓库（洁净历史）并切换 Pages**；只删除当前文件不能删除历史提交、缓存、fork 或第三方副本。

## 四、迁移优先级（现有资料待审核）

| 优先级 | 当前公开位置 | 风险与处置 |
| --- | --- | --- |
| 高 | `archive/characters/*.html` | 内含部分完整角色成长与关系设定。先私有备份，再发布读者摘要 |
| 高 | `archive/special-classes.html`、`archive/rules-supplement.html` | 内含隐藏职业及备选规则，应迁入私人仓库并公开有限摘要 |
| 高 | `archive/classes.html` | 部分进阶技能与详细职业路线需要逐条审核 |
| 中 | `archive/world.html`、`archive/laws.html`、`archive/ecology.html` | 地理与本源规则需按首揭章节拆分 |
| 中 | `assets/data/*.json`、`archive/orders.html` | 已发布事实、系统设计样例与作者推演必须分库 |
| 中 | `parts/recap-*.html`、`assets/data/search-index.json` | 只生成已发表章节可供读者理解的摘要 |
| 中 | `WRITING_STANDARD.md` | 编辑规范宜移入作者私人仓库 |

## 五、关于当前状态

- 现有公开仓库已建立 `.gitignore` 与 `scripts/audit-public-boundary.mjs`，并移除了一个前端作者预览捷径。
- **尚未完成私人仓库复制与公开 Git 历史清理**。因此目前不能宣称“秘密已从 GitHub 完全消失”。
- 前端逐章解锁只是读者体验设计，而不是保密技术。
