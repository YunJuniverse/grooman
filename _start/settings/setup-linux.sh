#!/bin/bash
# setup-linux.sh — _start/assets/in-spire.desktop 의 Exec/Icon 을 현재 절대경로로 갱신.
# 위치: _start/settings/setup-linux.sh
# 사용자 1회 실행:
#   bash _start/settings/setup-linux.sh
# 그 후 _start/assets/in-spire.desktop 을 ~/.local/share/applications/ 에 복사.

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # _start/settings/
ROOT="$(dirname "$HERE")"                              # _start/
EXEC_PATH="$ROOT/in-spire (linux).sh"
ICON_PATH="$ROOT/assets/icons/in-spire-256-linux.png"
DESKTOP_FILE="$ROOT/assets/in-spire.desktop"

if [ ! -f "$DESKTOP_FILE" ]; then
  echo "[err] $DESKTOP_FILE not found"
  exit 1
fi

# 공백 포함 경로 안전 처리 — | 구분자
sed -e "s|__EXEC__|$EXEC_PATH|" -e "s|__ICON__|$ICON_PATH|" \
  "$DESKTOP_FILE" > "$DESKTOP_FILE.tmp"
mv "$DESKTOP_FILE.tmp" "$DESKTOP_FILE"

echo "[ok] $DESKTOP_FILE updated:"
echo "  Exec=$EXEC_PATH"
echo "  Icon=$ICON_PATH"
echo ""
echo "To register in app menu:"
echo "  cp \"$DESKTOP_FILE\" ~/.local/share/applications/"
