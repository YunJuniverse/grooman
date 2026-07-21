#!/usr/bin/env bash
#
# check-no-arbitrary-color.sh — 디자인 토큰 가드레일 (fail-closed)
# --------------------------------------------------------------------------
# 색 하드코딩을 빌드 단계에서 차단한다. 두 종류를 잡는다:
#   1) arbitrary hex   : bg-[#1a1a2e], text-[#fff], border-[#abcdef] ...
#   2) off-system 팔레트 : 전 prefix(bg/text/border/ring/from/to/shadow/…) × 전 팔레트 family
#      (gray/slate/zinc … 뿐 아니라 red/orange/amber/yellow/…/rose 까지. C-001 교훈②)
# 의도적 예외(순백 max-contrast, 메달 gold/silver 등)는 ALLOW_HEX 에만 등록.
#
# 사용: bash guardrails/check-no-arbitrary-color.sh [scan_dir]
# 종료코드: 위반 0건 → 0(pass) / 1건+ → 1(fail, 빌드 차단)
# 기준: 20_guides/20_프론트엔드_디자인_토큰_시스템_규칙.md §4
set -euo pipefail

SCAN_DIR="${1:-src}"

# --- 의도적 예외 allowlist (hex, # 포함, 소문자) ---------------------------
# 예: ALLOW_HEX=("#ffffff" "#000000" "#ffd700" "#c0c0c0")
ALLOW_HEX=(
  # "#ffffff"   # 순백 max-contrast (필요 시 주석 해제)
)

# off-system 색 팔레트 (토큰을 우회한 *전체* Tailwind 팔레트 — 회색만이 아님. C-001 교훈②)
# 의도적 categorical/메달 색은 토큰 또는 ALLOW_HEX로 명시 분리할 것.
OFF_SYSTEM='(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)'

# 스캔 대상 확장자 (grep --include 글롭)
INCLUDES=(--include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' \
          --include='*.css' --include='*.html' --include='*.svelte' \
          --include='*.vue' --include='*.astro')

fail=0

# allowlist 를 grep -v 패턴으로 변환
build_allow_filter() {
  if [ "${#ALLOW_HEX[@]}" -eq 0 ]; then
    cat
    return
  fi
  local pat
  pat="$(printf '%s\n' "${ALLOW_HEX[@]}" | sed 's/[].[^$*\/]/\\&/g' | paste -sd '|' -)"
  grep -viE "\[($pat)\]" || true
}

echo "🎨 design-token guardrail — scanning '$SCAN_DIR' ..."

# --- 1. arbitrary hex: bg-[#...], text-[#...], etc. -----------------------
hex_hits="$(
  grep -rnoE "${INCLUDES[@]}" -- '-\[#[0-9a-fA-F]{3,8}\]' "$SCAN_DIR" 2>/dev/null \
    | build_allow_filter \
    || true
)"

# --- 2. off-system 회색/원색 유틸: text-gray-500, bg-slate-800 ... --------
gray_hits="$(
  grep -rnoE "${INCLUDES[@]}" -- "(bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret)-$OFF_SYSTEM-[0-9]{2,3}" "$SCAN_DIR" 2>/dev/null \
    || true
)"

if [ -n "$hex_hits" ]; then
  echo ""
  echo "❌ arbitrary hex 발견 (토큰으로 교체하거나 ALLOW_HEX에 등록):"
  echo "$hex_hits"
  fail=1
fi

if [ -n "$gray_hits" ]; then
  echo ""
  echo "❌ off-system 팔레트 유틸 발견 (시맨틱 토큰으로 교체 / 의도색은 ALLOW_HEX·토큰으로 명시):"
  echo "$gray_hits"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "✅ 위반 0건 — 모든 색이 토큰 경유."
else
  echo ""
  echo "→ 기준: 20_guides/20_프론트엔드_디자인_토큰_시스템_규칙.md §3-4"
fi

exit "$fail"
