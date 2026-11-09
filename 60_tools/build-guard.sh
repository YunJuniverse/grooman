#!/bin/sh
# build-guard — dev 서버 실행 중 next build 차단 (METH-122, 전수조사 P6)
#
# dev 중 build 는 .next 를 파괴해 500/하이드레이션 오류를 만든다 — 11개 repo 전수조사에서
# 같은 사고 7회 반복(ai-icons), SOP 문서만으로는 못 막았다. 이 스크립트가 강제 게이트다.
#
# 사용: package.json 의 build 를 감싸거나 직접 실행 —
#   sh 60_tools/build-guard.sh            # npx next build
#   sh 60_tools/build-guard.sh pnpm build # 임의 빌드 명령
# 우회(정말 의도한 경우만): BUILD_GUARD_FORCE=1
#
# 판정은 `methodology.py dev-check` 한 곳에서만 한다 (METH-142) — 이 프로젝트에서 뜬
# dev 서버만 본다(프로세스 cwd 를 lsof 로 확인). 예전엔 여기서 머신 전역 `pgrep` 을 따로
# 돌려, 다른 레포의 dev 와 자기 명령 문자열까지 잡았다(오탐 4회). 오탐이 반복되면 FORCE
# 우회가 습관이 되고, 그 습관이 진짜 경고를 지나치게 만든다 — 실제로 .next 를 2회 파괴했다.
# 판정을 두 벌 두면 한쪽만 고쳐진다(지침 19 §8b.1 원시함수 단일화).

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(dirname "$SCRIPT_DIR")

if [ -z "$BUILD_GUARD_FORCE" ]; then
  FOUND=""
  if command -v python3 >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/methodology.py" ]; then
    FOUND=$(python3 "$SCRIPT_DIR/methodology.py" dev-check --path "$ROOT" 2>/dev/null)
  else
    # 폴백 — python3 가 없는 환경. 전역 pgrep 이라 오탐이 가능하므로 그 사실을 밝힌다.
    FOUND=$(pgrep -fl "next dev" 2>/dev/null | grep -v -E "pkill|pgrep|build-guard" | head -1)
    [ -n "$FOUND" ] && FOUND="$FOUND  (전역 스캔 — python3 없음, 타 레포 dev 일 수 있음)"
  fi
  if [ -n "$FOUND" ]; then
    echo "[build-guard] dev 서버 실행 중 감지: $FOUND" >&2
    echo "[build-guard] dev 중 build 는 .next 를 파괴한다 — dev 를 중지(preview_stop)하고 재시도." >&2
    echo "[build-guard] 정말 의도한 경우만 BUILD_GUARD_FORCE=1 로 우회하고, 우회했으면 관찰로그에 friction 으로 남긴다." >&2
    exit 1
  fi
fi

if [ "$#" -gt 0 ]; then
  exec "$@"
fi
exec npx next build
