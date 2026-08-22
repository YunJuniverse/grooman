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
# 한계: pgrep 은 이 머신 전체의 "next dev" 를 잡는다(다른 repo 의 dev 포함).
# 병행 세션 환경에선 오탐보다 미탐이 비싸므로 보수적으로 차단한다.

if [ -z "$BUILD_GUARD_FORCE" ]; then
  FOUND=$(pgrep -fl "next dev" 2>/dev/null | head -1)
  if [ -n "$FOUND" ]; then
    echo "[build-guard] dev 서버 실행 중 감지: $FOUND" >&2
    echo "[build-guard] dev 중 build 는 .next 를 파괴한다 — dev 를 중지(preview_stop)하고 재시도." >&2
    echo "[build-guard] 정말 의도한 경우만 BUILD_GUARD_FORCE=1 로 우회." >&2
    exit 1
  fi
fi

if [ "$#" -gt 0 ]; then
  exec "$@"
fi
exec npx next build
