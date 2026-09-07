#!/usr/bin/env bash
# 开发服务器启动脚本
# 用法: ./start.sh [端口号]  默认 3000

set -e

PORT="${1:-3000}"
HOST="0.0.0.0"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

# 安装依赖（首次或缺失时）
if [ ! -d node_modules ]; then
  echo "→ 安装依赖中..."
  npm install
fi

# 清理占用端口
PIDS="$(lsof -t -i:"$PORT" 2>/dev/null || true)"
if [ -n "$PIDS" ]; then
  echo "→ 端口 $PORT 被占用，清理进程: $PIDS"
  kill -9 $PIDS 2>/dev/null || true
  sleep 1
fi

# 清理 Vite 缓存（可选，加 --clean 参数时触发）
if [ "$2" = "--clean" ]; then
  echo "→ 清理 Vite 缓存..."
  rm -rf node_modules/.vite
fi

echo "→ 启动开发服务器: http://localhost:$PORT/"
exec npm run dev -- --host "$HOST" --port "$PORT"
