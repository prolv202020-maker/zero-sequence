#!/usr/bin/env bash
# 《第零序列》全新公开仓库迁移工具
# 在已登录 GitHub CLI 的终端运行：bash scripts/create-clean-public-site.sh
set -Eeuo pipefail
SOURCE="prolv202020-maker/zero-sequence"
DEST="prolv202020-maker/zero-sequence-public"
DEST_SLUG="${DEST#*/}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
for cmd in git gh node python3; do command -v "$cmd" >/dev/null || { echo "缺少工具：$cmd"; exit 1; }; done
gh auth status >/dev/null || { echo "请先运行 gh auth login"; exit 1; }
if gh repo view "$DEST" >/dev/null 2>&1; then
  echo "目标仓库 $DEST 已存在。为避免覆盖，停止操作。"; exit 1
fi
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
echo "1/5 仅检出当前公开版本（不带旧历史）"
git clone --depth 1 "https://github.com/$SOURCE.git" "$WORK/site"
cd "$WORK/site"
node scripts/audit-public-boundary.mjs
# 不将旧 git 历史、作者备份或多余压缩资源带入新站
rm -rf .git
rm -f assets/images/covers/*.zip
# 处理旧网站的绝对路径，保留相对路径
echo "2/5 将固定路径替换成新站的项目路径"
export DEST_SLUG
python3 - <<'PY'
from pathlib import Path
import os
slug=os.environ["DEST_SLUG"]
extensions={".html",".js",".css",".json",".xml",".webmanifest",".txt",".md"}
count=0
for p in Path(".").rglob("*"):
    if not p.is_file() or p.suffix.lower() not in extensions: continue
    b=p.read_bytes()
    if b"/zero-sequence/" not in b: continue
    p.write_bytes(b.replace(b"/zero-sequence/",f"/{slug}/".encode()))
    count+=1
print("已更新固定路径的文本文件:",count)
PY
touch .nojekyll
node scripts/audit-public-boundary.mjs
echo "3/5 建立全新 Git 历史"
git init -b main
git config user.name "$(gh api user --jq .login)"
git config user.email "$(gh api user --jq .id)+$(gh api user --jq .login)@users.noreply.github.com"
git add -A
git commit -m "Initial clean public release of The Zero Sequence"
echo "4/5 创建新的 PUBLIC 仓库并上传"
gh repo create "$DEST" --public --source . --remote origin --push
echo "5/5 配置 GitHub Pages（main / 根目录）"
if gh api --method POST "repos/$DEST/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1; then
  echo "Pages 已请求开启"
else
  echo "请在仓库 Settings > Pages 手动选 Deploy from a branch / main / root"
fi
echo "完成： https://github.com/$DEST"
echo "预计网址： https://${DEST%%/*}.github.io/$DEST_SLUG/"
echo "请先检查新站，暂时不要删除旧仓库或迁移旧站流量。"
