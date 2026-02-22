#!/usr/bin/env bash
# 데일리 노트 경로 기준으로 서버 실행
# 사용: OBSIDIAN_TOKEN=비밀토큰 ./server/start.sh

cd "$(dirname "$0")/.."

export OBSIDIAN_DAILY_PATH="/Users/giseokdo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/kido-database/SecondBrain/01_Daily"

if [ -z "$OBSIDIAN_TOKEN" ]; then
  echo "OBSIDIAN_TOKEN을 설정하세요."
  echo "예: OBSIDIAN_TOKEN=비밀토큰 ./server/start.sh"
  exit 1
fi

exec node server/index.js
