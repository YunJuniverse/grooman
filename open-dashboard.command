#!/bin/bash
# open-dashboard.command — Finder 더블클릭으로 dashboard 열기 (macOS).
#
# 동작:
#   1. 이 파일이 있는 폴더로 cd
#   2. methodology dashboard --open 호출 (자동 포트 + 브라우저 자동 열기)
#
# 우회/직접 호출: python3 50_tools/methodology.py dashboard --open
#
# Finder 더블클릭 시 macOS 가 Terminal 에서 자동 실행. 종료 시 창은 자동으로 닫히지 않음 (사용자가 닫음).

set -e
cd "$(dirname "$0")"

if [ ! -f "50_tools/methodology.py" ]; then
  echo "[err] 50_tools/methodology.py 미발견. 이 파일을 방법론이 적용된 프로젝트 루트에 두세요." >&2
  echo
  read -p "엔터로 종료..."
  exit 1
fi

python3 50_tools/methodology.py dashboard --open

echo
echo "─────────────────────────────────────────────────────────────"
echo "dashboard 가 백그라운드에서 서빙됩니다. 종료하려면:"
echo "  python3 50_tools/methodology.py dashboard stop --all"
echo "또는 dashboard UI 의 Stop 버튼."
echo "─────────────────────────────────────────────────────────────"
